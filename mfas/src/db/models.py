from typing import Optional, Any
from sqlmodel import SQLModel, Field
from datetime import datetime

class Investigation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    query: str
    risk_level: str  # high, medium, low
    confidence: float
    result_json: str  # Serialized JSON of full result
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    company: str
    risk_level: str
    summary: str
    investigation_id: Optional[int] = Field(default=None, foreign_key="investigation.id")
    sections_json: str  # Serialized list of {title, content}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    risk_level: str
    company: str
    exposure: Optional[float] = None
    acknowledged: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IngestionJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    status: str  # pending, running, done, error
    steps_json: str  # Serialized list of pipeline step statuses
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    organization: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

