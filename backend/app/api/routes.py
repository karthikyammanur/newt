from fastapi import APIRouter, Request, Depends, HTTPException, status, Header
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
from app.db.mongodb import db
from app.utils.personalized_feed import get_personalized_feed
from app.db.likes_db import like_article, unlike_article, get_liked_articles
from datetime import timedelta, datetime
import random
from jose import jwt as jose_jwt
from typing import Optional
from bson import ObjectId

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

summaries_collection = db['summaries']

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.get("/health/mongodb")
def mongodb_health_check():
    from app.db.mongodb import get_mongo_client
    try:
        client = get_mongo_client()
        # The 'ping' command is the most basic way to check connection
        client.admin.command('ping')
        return {"mongodb": "connected"}
    except Exception as e:
        return {"mongodb": "error", "detail": str(e)}

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
async def get_summaries(
    token: Optional[str] = Header(None, alias="Authorization"),
    topic: Optional[str] = None
):
    user_id = None
    if token:
        # Remove 'Bearer ' prefix if present
        if token.lower().startswith('bearer '):
            token = token[7:]
        try:
            payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
        except Exception:
            user_id = None
    
    # Personalized feed if user is authenticated
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

    # Public summaries (optionally filtered by topic)
    query = {}
    if topic:
        query["topic"] = topic
    
    # Get unique summaries, limit to 3 most recent, unique by title
    recent = list(summaries_collection.find(query).sort("date", -1).limit(10))
    
    # Remove duplicates and limit results
    seen_titles = set()
    unique_summaries = []
    for s in recent:
        title = s.get("title", "").strip()
        if title and title not in seen_titles:
            seen_titles.add(title)
            unique_summaries.append(s)
        elif not title:  # Include summaries without titles
            unique_summaries.append(s)
        
        if len(unique_summaries) >= 3:  # Limit to 3 unique summaries
            break

    return [
        {
            "topic": s["topic"],
            "summary": s["summary"],
            "timestamp": s["date"].isoformat() if s.get("date") else None,
            "title": s.get("title", ""),
            "sources": s.get("sources", [])
        }
        for s in unique_summaries
    ]

@router.get("/past_summaries")
async def get_past_summaries(topic: str = None):
    query = {}
    if topic:
        query["topic"] = topic
    # Return all summaries for the topic, sorted by date descending
    past = list(summaries_collection.find(query).sort("date", -1))
    return [
        {
            "_id": str(s.get("_id")),
            "topic": s.get("topic"),
            "summary": s.get("summary"),
            "timestamp": s.get("date").isoformat() if s.get("date") else None,
            "title": s.get("title", ""),
            "sources": s.get("sources", [])
        }
        for s in past
    ]

@router.post("/like/{article_id}")
async def like(article_id: str, token: str = Depends(oauth2_scheme)):
    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    like_article(user_id, article_id)
    return {"status": "liked", "article_id": article_id}

@router.post("/unlike/{article_id}")
async def unlike(article_id: str, token: str = Depends(oauth2_scheme)):
    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    unlike_article(user_id, article_id)
    return {"status": "unliked", "article_id": article_id}

@router.get("/likes")
async def get_likes(token: str = Depends(oauth2_scheme)):
    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    liked = get_liked_articles(user_id)
    return {"liked": liked}