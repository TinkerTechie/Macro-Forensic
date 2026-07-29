import re
import os
from typing import Optional
from fastapi import HTTPException, UploadFile

# Security limits
MAX_QUERY_LENGTH = 2000
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_MIME_TYPES = ["application/pdf", "text/html", "text/plain"]
ALLOWED_EXTENSIONS = [".pdf", ".html", ".htm", ".txt"]

def sanitize_query(query: str) -> str:
    """
    Strips HTML and potentially dangerous script tags from a query string.
    Enforces maximum length limits to prevent denial of service (DoS) via huge inputs.
    """
    if not query:
        return ""
    
    # 1. Length check
    if len(query) > MAX_QUERY_LENGTH:
        raise HTTPException(
            status_code=400, 
            detail=f"Query exceeds maximum allowed length of {MAX_QUERY_LENGTH} characters."
        )

    # 2. Strip basic HTML tags
    clean = re.sub(r'<[^>]*>', '', query)
    
    # 3. Prevent simple script injection attempts
    # Note: In a real-world scenario, you might use a robust library like bleach, 
    # but since this is going to an LLM, stripping tags is usually sufficient.
    clean = clean.replace("javascript:", "")
    clean = clean.replace("vbscript:", "")
    clean = clean.replace("onload=", "")
    clean = clean.replace("onerror=", "")
    
    return clean.strip()


async def validate_uploaded_file(file: UploadFile) -> None:
    """
    Validates an uploaded file's type, extension, and size.
    Raises HTTPException if invalid.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
        
    # Check extension
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file extension: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type: {file.content_type}. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
        )
        
    # Check size (requires seeking)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB."
        )
