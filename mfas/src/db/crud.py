from typing import List, Optional
from sqlmodel import Session, select
from .models import Investigation, Report, Alert, IngestionJob, User

def create_investigation(session: Session, inv: Investigation) -> Investigation:
    session.add(inv)
    session.commit()
    session.refresh(inv)
    return inv

def get_investigation(session: Session, inv_id: int) -> Optional[Investigation]:
    return session.get(Investigation, inv_id)

def list_investigations(session: Session, skip: int = 0, limit: int = 100) -> List[Investigation]:
    statement = select(Investigation).order_by(Investigation.created_at.desc()).offset(skip).limit(limit)
    return session.exec(statement).all()

def create_report(session: Session, report: Report) -> Report:
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

def list_reports(session: Session, skip: int = 0, limit: int = 100) -> List[Report]:
    statement = select(Report).order_by(Report.created_at.desc()).offset(skip).limit(limit)
    return session.exec(statement).all()

def create_alert(session: Session, alert: Alert) -> Alert:
    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert

def list_alerts(session: Session, skip: int = 0, limit: int = 100) -> List[Alert]:
    statement = select(Alert).order_by(Alert.created_at.desc()).offset(skip).limit(limit)
    return session.exec(statement).all()

def acknowledge_alert(session: Session, alert_id: int) -> Optional[Alert]:
    alert = session.get(Alert, alert_id)
    if alert:
        alert.acknowledged = True
        session.add(alert)
        session.commit()
        session.refresh(alert)
    return alert

def create_ingestion_job(session: Session, job: IngestionJob) -> IngestionJob:
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

def update_ingestion_job(session: Session, job_id: int, status: str, steps_json: str, error_message: str = None) -> Optional[IngestionJob]:
    job = session.get(IngestionJob, job_id)
    if job:
        job.status = status
        job.steps_json = steps_json
        if error_message:
            job.error_message = error_message
        session.add(job)
        session.commit()
        session.refresh(job)
    return job

def create_user(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()

