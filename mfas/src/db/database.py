import os
from sqlmodel import create_engine, SQLModel, Session

# By default, use SQLite in local dev. In production, use Postgres URL.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mfas.db")

# SQLite specific args
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

def create_db_and_tables():
    # Import models to ensure they are registered with SQLModel
    from . import models  # noqa
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
