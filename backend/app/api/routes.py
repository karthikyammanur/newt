from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.utils.summarizer import summarize_topic
from app.utils.news_fetcher import fetch_articles, TECH_KEYWORDS
from app.core.auth import (
    Token, UserCreate, create_access_token, 
    get_password_hash, verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
)
from app.db.database import get_db, User
from app.db.mongodb import get_recent_summaries
from app.utils.personalized_feed import get_personalized_feed
from datetime import timedelta, datetime
import random
from jose import jwt as jose_jwt

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.post("/auth/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "email": user.email}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "email": user.email}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/summarize")
async def summarize(request: Request):
    body = await request.json()
    topic = body.get("topic", "")
    if not topic:
        return {"error": "No topic provided."}
    
    summary = summarize_topic(topic)
    return {"summary": summary}

@router.get("/summaries")
async def get_summaries(token: str = Depends(oauth2_scheme)):
    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        user_id = None

    if user_id:
        summaries = get_personalized_feed(user_id)
        if summaries:
            return [
                {
                    "topic": s["topic"],
                    "summary": s["summary"],
                    "timestamp": s["date"].isoformat() if s.get("date") else None
                }
                for s in summaries
            ]

    recent = get_recent_summaries(limit=5)
    return [
        {
            "topic": s["topic"],
            "summary": s["summary"],
            "timestamp": s["date"].isoformat() if s.get("date") else None
        }
        for s in recent
    ]