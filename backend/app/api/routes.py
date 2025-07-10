from fastapi import APIRouter, Request, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.utils.summarizer import summarize_topic
from app.utils.news_fetcher import fetch_articles, TECH_KEYWORDS
from app.core.auth import (
    Token, UserCreate, UserResponse, create_access_token, 
    get_password_hash, verify_password, get_current_user,
    get_current_user_email, oauth2_scheme,
    ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
)
from app.db.mongodb import (
    db, create_user, get_user_by_email, get_user_by_id,
    update_user_read_log, get_user_stats, get_user_dashboard_analytics,
    follow_user, unfollow_user, get_user_followers, get_user_following, get_all_users,
    get_user_top_topics, get_recent_activity, calculate_reading_streak
)
from app.utils.personalized_feed import get_personalized_feed
from app.db.likes_db import like_article, unlike_article, get_liked_articles
from datetime import timedelta, datetime
import random
from jose import jwt as jose_jwt
from typing import Optional
from bson import ObjectId
import pytz
from pydantic import BaseModel

router = APIRouter()

summaries_collection = db['summaries']

class ReadSummaryRequest(BaseModel):
    summary_id: str

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
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = create_user(user.email, hashed_password)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": new_user["user_id"]}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Get user by email
    user = get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "user_id": user["user_id"]}, 
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

@router.get("/summaries/today")
async def get_todays_summaries():
    """Get all summaries generated for the current day (Central Time)"""
    # Calculate today's date range in Central Time
    central_tz = pytz.timezone('US/Central')
    now_central = datetime.now(central_tz)
    today_start_central = now_central.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end_central = now_central.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Convert to UTC for MongoDB query
    today_start_utc = today_start_central.astimezone(pytz.UTC)
    today_end_utc = today_end_central.astimezone(pytz.UTC)
      # Query for today's summaries
    query = {
        "date": {
            "$gte": today_start_utc,
            "$lte": today_end_utc
        }
    }
    
    # Get today's summaries, sorted by timestamp (latest first)
    todays_summaries = list(summaries_collection.find(query).sort("date", -1))
    
    return [
        {
            "_id": str(s.get("_id")),
            "title": s.get("title", ""),
            "summary": s.get("summary", ""),
            "topic": s.get("topic", ""),
            "date": s.get("date").isoformat() if s.get("date") else None,
            "sources": s.get("sources", [])
        }
        for s in todays_summaries
    ]

@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    stats = get_user_stats(current_user["user_id"])
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User stats not found"
        )
    
    return UserResponse(
        user_id=stats["user_id"],
        email=stats["email"],
        points=stats["points"],
        total_summaries_read=stats["total_summaries_read"],
        today_reads=stats["today_reads"]
    )

@router.post("/summaries/{summary_id}/read")
async def mark_summary_read(
    summary_id: str, 
    current_user: dict = Depends(get_current_user)
):
    """Mark a summary as read by the current user"""
    result = update_user_read_log(current_user["user_id"], summary_id)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to update read log")
        )
    
    return {
        "message": "Summary marked as read", 
        "points_earned": result["points_awarded"],
        "already_read": result["already_read"],
        "streak": result.get("streak", {
            "current": 0,
            "max": 0,
            "updated": False
        })
    }

@router.post("/read_summary")
async def read_summary(
    request: ReadSummaryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a summary as read by the current user.
    Updates user's summaries_read list, increments points, and logs daily read.
    """
    user_id = current_user["user_id"]
    summary_id = request.summary_id
    
    # Validate summary_id format
    try:
        ObjectId(summary_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid summary ID format"
        )
    
    # Check if summary exists in database
    summary = summaries_collection.find_one({"_id": ObjectId(summary_id)})
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    # Update user's read log
    result = update_user_read_log(user_id, summary_id)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to update read log")
        )
      # Get updated user stats
    updated_stats = get_user_stats(user_id)
    
    return {
        "message": "Summary processed successfully",
        "points_earned": result["points_awarded"],
        "total_points": updated_stats["points"],
        "today_reads": updated_stats["today_reads"],
        "total_summaries_read": updated_stats["total_summaries_read"],
        "already_read": result["already_read"],
        "streak": result.get("streak", {
            "current": 0,
            "max": 0,
            "updated": False
        })
    }

@router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Get comprehensive dashboard analytics for authenticated user"""
    try:
        user_id = current_user["user_id"]
        analytics = get_user_dashboard_analytics(user_id)
        
        if not analytics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analytics data not found"
            )
        
        return {
            "success": True,
            "analytics": analytics,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dashboard analytics: {str(e)}"
        )

# Follow/Unfollow Endpoints
@router.post("/follow/{target_user_id}")
async def follow_user_endpoint(
    target_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Follow a user"""
    follower_id = current_user["user_id"]
    
    result = follow_user(follower_id, target_user_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return {
        "success": True,
        "message": result["message"],
        "follower_id": follower_id,
        "target_user_id": target_user_id
    }

@router.post("/unfollow/{target_user_id}")
async def unfollow_user_endpoint(
    target_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unfollow a user"""
    follower_id = current_user["user_id"]
    
    result = unfollow_user(follower_id, target_user_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return {
        "success": True,
        "message": result["message"],
        "follower_id": follower_id,
        "target_user_id": target_user_id
    }

@router.get("/user/{user_id}/followers")
async def get_user_followers_endpoint(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get list of user's followers"""
    result = get_user_followers(user_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"]
        )
    
    return {
        "success": True,
        "user_id": user_id,
        "followers": result["followers"],
        "follower_count": result["follower_count"]
    }

@router.get("/user/{user_id}/following")
async def get_user_following_endpoint(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get list of users that this user is following"""
    result = get_user_following(user_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"]
        )
    
    return {
        "success": True,
        "user_id": user_id,
        "following": result["following"],
        "following_count": result["following_count"]
    }

@router.get("/users")
async def get_all_users_endpoint(
    current_user: dict = Depends(get_current_user),
    limit: int = 50
):
    """Get list of all users for discovery"""
    current_user_id = current_user["user_id"]
    
    result = get_all_users(current_user_id, limit)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )
    
    return {
        "success": True,
        "users": result["users"],
        "total_count": result["total_count"]
    }

@router.get("/user/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get user profile with follow status, top topics, and recent activity"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    current_user_id = current_user["user_id"]
    
    # Check if current user is following this user
    is_following = user_id in current_user.get("following", [])
    
    # Check if this user is following current user
    is_follower = current_user_id in user.get("followers", [])
    
    # Get top topics for this user
    top_topics = get_user_top_topics(user_id, limit=3)
    
    # Get recent activity
    daily_read_log = user.get("daily_read_log", {})
    recent_activity_data = get_recent_activity(daily_read_log, days=7)
    
    # Convert recent activity to include titles from summaries
    recent_activity = []
    summaries_read = user.get("summaries_read", [])
    
    # Get recent summaries with topics for activity display
    for activity in recent_activity_data:
        if activity["reads"] > 0:
            # Find summaries read on this date
            activity_summaries = []
            date_str = activity["date"]
            
            # For simplicity, we'll show the most recent summaries
            # In a real implementation, you'd store read timestamps
            for summary_id in summaries_read[-activity["reads"]:]:
                try:
                    summary = summaries_collection.find_one({"_id": ObjectId(summary_id)})
                    if summary:                        activity_summaries.append({
                            "title": summary.get("title", "Article Read"),
                            "topic": summary.get("topic", "General"),
                            "date": date_str
                        })
                except:
                    continue
            
            recent_activity.extend(activity_summaries)
    
    # Calculate reading streak
    reading_streak = calculate_reading_streak(user)
    
    # Calculate average daily reads
    daily_counts = list(daily_read_log.values()) if daily_read_log else [0]
    avg_daily_reads = round(sum(daily_counts) / len(daily_counts), 1) if daily_counts else 0
    
    return {
        "success": True,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "points": user.get("points", 0),
            "total_summaries_read": len(user.get("summaries_read", [])),
            "follower_count": len(user.get("followers", [])),
            "following_count": len(user.get("following", [])),
            "created_at": user["created_at"],
            "is_following": is_following,
            "is_follower": is_follower,
            "is_self": user_id == current_user_id,
            "top_topics": top_topics,
            "recent_activity": recent_activity[-5:],  # Last 5 activities
            "reading_streak": reading_streak,
            "avg_daily_reads": avg_daily_reads
        }
    }