import json
import logging
import uuid
import os
import shutil
import hashlib
import datetime
from pathlib import Path
from typing import List, Optional

import jwt
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlmodel import Session

from src.db.database import create_db_and_tables, get_session
from src.db import crud, models
from src.security.sanitizer import sanitize_query, validate_uploaded_file
from src.pipeline.orchestrator import MFASPipeline
from pydantic import BaseModel

# ── JWT config ──────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "mfas-super-secret-jwt-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

def hash_password(password: str) -> str:
    """PBKDF2-SHA256 with 200k iterations."""
    return hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        b'mfas_salt_2026',
        200000
    ).hex()

def create_jwt(user_id: int, email: str, full_name: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "name": full_name,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    """FastAPI dependency — validates Bearer JWT and returns payload."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")
    token = authorization.removeprefix("Bearer ").strip()
    return verify_jwt(token)

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="MFAS API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_request_id_header(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# ── Pydantic schemas ─────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    query: str

class RegisterRequest(BaseModel):
    full_name: str
    organization: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ── Public endpoints ─────────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.post("/api/auth/register")
async def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    email_clean = payload.email.strip().lower()
    if crud.get_user_by_email(session, email_clean):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = models.User(
        full_name=payload.full_name.strip(),
        organization=payload.organization.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password)
    )
    user = crud.create_user(session, user)
    token = create_jwt(user.id, user.email, user.full_name)

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "organization": user.organization,
            "email": user.email
        }
    }

@app.post("/api/auth/login")
async def login(payload: LoginRequest, session: Session = Depends(get_session)):
    email_clean = payload.email.strip().lower()
    user = crud.get_user_by_email(session, email_clean)
    if not user or user.password_hash != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_jwt(user.id, user.email, user.full_name)

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "organization": user.organization,
            "email": user.email
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    """Returns the currently authenticated user's profile."""
    user = crud.get_user_by_email(session, current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"id": user.id, "full_name": user.full_name, "organization": user.organization, "email": user.email}


@app.post("/ingest")
@limiter.limit("5/minute")
async def ingest_document(request: Request, file: UploadFile = File(...), session: Session = Depends(get_session)):
    await validate_uploaded_file(file)
    
    # Save file temporarily
    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / file.filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create job in DB
    job = models.IngestionJob(
        filename=file.filename,
        status="running",
        steps_json="[]"
    )
    job = crud.create_ingestion_job(session, job)

    try:
        pipeline = MFASPipeline()
        stats = pipeline.ingest(file_path)
        
        crud.update_ingestion_job(session, job.id, "done", json.dumps(stats))
        return {"status": "success", "job_id": job.id, "stats": stats}
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        crud.update_ingestion_job(session, job.id, "error", "[]", str(e))
        raise HTTPException(status_code=500, detail="Ingestion pipeline failed.")

@app.post("/ask")
@limiter.limit("10/minute")
async def ask_question(request: Request, payload: AskRequest, session: Session = Depends(get_session)):
    clean_query = sanitize_query(payload.query)
    
    try:
        pipeline = MFASPipeline()
        answer = pipeline.ask(clean_query)
        
        # Determine basic properties from answer
        # The structure of 'answer' depends on the orchestrator graph state output
        # E.g., answer could be a string or a dict. Assuming string or dict with keys.
        result_str = json.dumps(answer) if isinstance(answer, dict) else str(answer)
        
        inv = models.Investigation(
            query=clean_query,
            risk_level="medium", # This should ideally be parsed from the agent output
            confidence=0.85,     # Same here
            result_json=result_str
        )
        inv = crud.create_investigation(session, inv)
        
        return {"status": "success", "investigation_id": inv.id, "result": answer}
    except Exception as e:
        logger.error(f"Ask error: {e}")
        raise HTTPException(status_code=500, detail="Investigation pipeline failed.")

@app.post("/api/investigate/stream")
@limiter.limit("10/minute")
async def ask_question_stream(request: Request, payload: AskRequest):
    """
    Server-Sent Events (SSE) endpoint to stream LangGraph execution steps.
    """
    clean_query = sanitize_query(payload.query)
    pipeline = MFASPipeline()
    
    return StreamingResponse(
        pipeline.ask_stream(clean_query),
        media_type="text/event-stream"
    )

@app.get("/investigations")
async def get_investigations(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return crud.list_investigations(session, skip=skip, limit=limit)

@app.get("/investigations/{inv_id}")
async def get_investigation(inv_id: int, session: Session = Depends(get_session)):
    inv = crud.get_investigation(session, inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv

@app.get("/reports")
async def get_reports(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return crud.list_reports(session, skip=skip, limit=limit)

@app.get("/alerts")
async def get_alerts(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return crud.list_alerts(session, skip=skip, limit=limit)
