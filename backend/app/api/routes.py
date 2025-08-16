from fastapi import APIRouter, Request, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# Temporarily disable summarizer import due to PyTorch issues
# from app.utils.summarizer import summarize_topic
from app.utils.news_fetcher import fetch_articles, TECH_KEYWORDS
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("api_routes")

# Temporary placeholder function
def summarize_topic(topic):
    return {
        "title": f"Tech News Summary: {topic}",
        "summary": f"This is a placeholder summary for {topic}. The full summarization feature is temporarily disabled due to dependency issues.",
        "topic": topic,
        "sources": ["placeholder-source.com"],
        "date": "2025-08-02",
        "_id": f"temp-{topic}-summary"
    }
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
import google.generativeai as genai
import os

router = APIRouter()

# Configure Gemini
try:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        genai.configure(api_key=gemini_api_key)
        print("✅ Gemini API configured")
    else:
        print("⚠️ Warning: GEMINI_API_KEY not found in environment")
except Exception as e:
    print(f"⚠️ Warning: Gemini configuration error: {e}")

summaries_collection = db['summaries']

class ReadSummaryRequest(BaseModel):
    summary_id: str

class AIAgentRequest(BaseModel):
    input: str

class AskAIRequest(BaseModel):
    question: str

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
    logger.info(f"Registration attempt for user: {user.email}")
    # Check if user already exists
    existing_user = get_user_by_email(user.email)
    if existing_user:
        logger.warning(f"Registration failed - email already exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create new user with proper password hashing
        hashed_password = get_password_hash(user.password)
        new_user = create_user(user.email, hashed_password)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": new_user["user_id"]}, 
            expires_delta=access_token_expires
        )
        
        logger.info(f"Registration successful for user: {user.email}")
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Registration error for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user account"
        )

@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    
    # Get user by email
    user = get_user_by_email(form_data.username)
    if not user:
        logger.warning(f"Login failed - user not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        logger.warning(f"Login failed - incorrect password for user: {form_data.username}")
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
    
    logger.info(f"Login successful for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/summarize")
async def summarize(request: Request):
    body = await request.json()
    topic = body.get("topic", "")
    if not topic:
        return {"error": "No topic provided."}
    
    summary = summarize_topic(topic)
    return {"summary": summary}

async def get_todays_summaries_for_ai():
    """Get today's summaries for AI context (helper function)"""
    try:
        # Calculate today's date range in Central Time
        central_tz = pytz.timezone('US/Central')
        now_central = datetime.now(central_tz)
        today_start_central = now_central.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end_central = now_central.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Convert to UTC for timezone-aware comparison
        today_start_utc = today_start_central.astimezone(pytz.UTC)
        today_end_utc = today_end_central.astimezone(pytz.UTC)
        
        # Also get naive versions for naive datetime comparison
        today_start_naive = today_start_central.replace(tzinfo=None)
        today_end_naive = today_end_central.replace(tzinfo=None)
        
        # Query for today's summaries using both timezone-aware and naive dates
        query = {
            "$or": [
                {
                    "date": {
                        "$gte": today_start_utc,
                        "$lte": today_end_utc
                    }
                },
                {
                    "date": {
                        "$gte": today_start_naive,
                        "$lte": today_end_naive
                    }
                }
            ]
        }
        
        # Get today's summaries, sorted by timestamp (latest first)
        todays_summaries = list(summaries_collection.find(query).sort("date", -1).limit(10))
        
        return [
            {
                "topic": s.get("topic", ""),
                "title": s.get("title", ""),
                "summary": s.get("summary", "")[:300] + "..." if len(s.get("summary", "")) > 300 else s.get("summary", "")  # Truncate for prompt brevity
            }
            for s in todays_summaries
        ]
    except Exception as e:
        print(f"Error getting today's summaries for AI: {e}")
        return []

async def get_user_liked_topics_context(user_id: str):
    """Get user's liked topics and reading preferences for AI context"""
    try:
        # Get user's top topics
        top_topics = get_user_top_topics(user_id, limit=5)
        
        # Get liked articles to understand preferences
        liked_articles = get_liked_articles(user_id)
        
        # Get topics from liked articles
        liked_topics = set()
        for article_id in liked_articles[-10:]:  # Last 10 liked articles
            try:
                # Try to find summary by ObjectId first
                summary = summaries_collection.find_one({"_id": ObjectId(article_id)})
                if summary and summary.get("topic"):
                    liked_topics.add(summary["topic"])
            except:
                # If ObjectId fails, try as string
                summary = summaries_collection.find_one({"_id": article_id})
                if summary and summary.get("topic"):
                    liked_topics.add(summary["topic"])
        
        return {
            "top_read_topics": top_topics,
            "recently_liked_topics": list(liked_topics),
            "total_liked_articles": len(liked_articles)
        }
    except Exception as e:
        print(f"Error getting user liked topics: {e}")
        return {
            "top_read_topics": [],
            "recently_liked_topics": [],
            "total_liked_articles": 0
        }

@router.post("/ask-ai")
async def ask_ai(
    request: AskAIRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    AI chat endpoint for the chat modal - simpler interface than the ai-agent endpoint
    """
    print(f"[ASK-AI] === NEW REQUEST STARTED ===")
    print(f"[ASK-AI] Request received with question: {request.question[:50]}...")
    
    try:
        question = request.question.strip()
        if not question:
            print("[ASK-AI] Error: Empty question")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question cannot be empty"
            )
        
        user_id = current_user["user_id"]
        
        # Get today's summaries for context
        todays_summaries = await get_todays_summaries_for_ai()
        
        # Build prompt for Gemini
        system_prompt = "You are Newt AI, a helpful assistant for a news summarization app. Keep your responses conversational, friendly, and concise (under 200 words). You help users understand today's news, their reading habits, and how to use the app."
        
        # Add summaries context if available
        news_context = ""
        if todays_summaries:
            news_context = "\n\nToday's top news topics: "
            news_context += ", ".join([s.get("topic", "Unknown topic") for s in todays_summaries[:5]])
            
            # Add a brief summary of the first few articles
            news_context += "\n\nHighlights from today's news:\n"
            for i, summary in enumerate(todays_summaries[:2], 1):
                news_context += f"- {summary.get('title', f'Topic: {summary.get('topic', 'Unknown')}')}.\n"
        
        # Complete prompt
        full_prompt = f"{system_prompt}{news_context}\n\nUser: {question}\n\nNewt AI:"
        
        print("[ASK-AI] Calling Gemini API...")
        # Call Gemini API
        try:
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if not gemini_api_key:
                print("[ASK-AI] Error: GEMINI_API_KEY not configured")
                raise Exception("GEMINI_API_KEY not configured")
                
            model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
            response = model.generate_content(full_prompt)
            
            if response and response.text:
                ai_response = response.text.strip()
                print(f"[ASK-AI] Gemini response received: {ai_response[:100]}...")
            else:
                print("[ASK-AI] Gemini response empty")
                ai_response = "I apologize, but I couldn't generate a response right now. Please try again in a moment."
                
        except Exception as gemini_error:
            print(f"[ASK-AI] Gemini API error: {gemini_error}")
            ai_response = "I'm currently having trouble connecting to my AI systems. Please try again in a moment, or check out the latest summaries in the app!"
        
        return {
            "response": ai_response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ASK-AI] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="I'm having trouble connecting right now. Please try again in a moment."
        )

@router.post("/ai-agent")
async def ai_agent(
    request: AIAgentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    AI agent endpoint powered by Gemini with fixed system prompt and contextual data
    """
    print(f"[AI-AGENT] === NEW REQUEST STARTED ===")
    print(f"[AI-AGENT] Request received with input: {request.input[:50]}...")
    print(f"[AI-AGENT] Current user: {current_user.get('email', 'Unknown')}")
    
    try:
        user_input = request.input.strip()
        if not user_input:
            print("[AI-AGENT] Error: Empty input")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Input cannot be empty"
            )
        
        print("[AI-AGENT] Getting user context...")
        # Get user context
        user_id = current_user["user_id"]
        user_email = current_user.get("email", "")
        
        # Get user stats
        user_stats = get_user_stats(user_id)
        total_reads = user_stats.get("total_summaries_read", 0) if user_stats else 0
        user_points = user_stats.get("points", 0) if user_stats else 0
        
        print("[AI-AGENT] Getting today's summaries...")
        # Get today's summaries from database
        todays_summaries = await get_todays_summaries_for_ai()
        print(f"[AI-AGENT] Found {len(todays_summaries)} summaries for today")
        
        print("[AI-AGENT] Getting user preferences...")
        # Get user's liked topics from database
        user_preferences = await get_user_liked_topics_context(user_id)
        
        # Build fixed system prompt as specified
        system_prompt = "You are a helpful AI assistant for a news summarization app. You can only answer questions based on the news summaries and user stats provided below."
        
        # Build contextual data sections
        summaries_section = ""
        if todays_summaries:
            summaries_section = "\n\nTODAY'S NEWS SUMMARIES:\n"
            for i, summary in enumerate(todays_summaries[:5], 1):
                summaries_section += f"{i}. Topic: {summary['topic']}\n"
                summaries_section += f"   Title: {summary['title']}\n"
                summaries_section += f"   Summary: {summary['summary']}\n\n"
        else:
            summaries_section = "\n\nTODAY'S NEWS SUMMARIES: No summaries available for today.\n"
        
        # Build user stats section
        user_stats_section = f"\n\nUSER STATS:\n"
        user_stats_section += f"- User: {user_email.split('@')[0] if user_email else 'Reader'}\n"
        user_stats_section += f"- Articles read: {total_reads}\n"
        user_stats_section += f"- Points earned: {user_points}\n"
        
        # Build liked topics section
        liked_topics_section = ""
        if user_preferences["top_read_topics"]:
            liked_topics_section += f"- Most read topics: {', '.join([t['topic'] for t in user_preferences['top_read_topics'][:3]])}\n"
        if user_preferences["recently_liked_topics"]:
            liked_topics_section += f"- Recently liked topics: {', '.join(user_preferences['recently_liked_topics'][:3])}\n"
        if user_preferences["total_liked_articles"] > 0:
            liked_topics_section += f"- Total articles liked: {user_preferences['total_liked_articles']}\n"
        
        # Combine all sections for Gemini prompt
        full_prompt = f"{system_prompt}{summaries_section}{user_stats_section}{liked_topics_section}\n\nUser question: {user_input}\n\nResponse:"
        
        print("[AI-AGENT] Calling Gemini API...")
        # Call Gemini API
        try:
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if not gemini_api_key:
                print("[AI-AGENT] Error: GEMINI_API_KEY not configured")
                raise Exception("GEMINI_API_KEY not configured")
                
            model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
            response = model.generate_content(full_prompt)
            
            if response and response.text:
                ai_response = response.text.strip()
                print(f"[AI-AGENT] Gemini response received: {ai_response[:100]}...")
            else:
                print("[AI-AGENT] Gemini response empty")
                ai_response = "I apologize, but I couldn't generate a response right now. Please try again in a moment."
                
        except Exception as gemini_error:
            print(f"[AI-AGENT] Gemini API error: {gemini_error}")
            # Provide a fallback response based on the available data
            if todays_summaries:
                ai_response = f"Based on today's news, we have {len(todays_summaries)} tech summaries covering topics like {', '.join(set([s['topic'] for s in todays_summaries[:3]]))}. I'm currently having trouble connecting to my AI systems, but you can check out these summaries in the app!"
            else:
                ai_response = "I'm currently having trouble connecting to my AI systems. Please try again in a moment, or check out the latest summaries in the app!"
        
        print(f"[AI-AGENT] Returning response: {ai_response[:100]}...")
        return {
            "response": ai_response,
            "user_context": {
                "articles_read": total_reads,
                "points": user_points,
                "todays_news_count": len(todays_summaries),
                "top_topics": [t["topic"] for t in user_preferences["top_read_topics"][:3]],
                "liked_articles_count": user_preferences["total_liked_articles"]
            }
        }
        
    except HTTPException:
        print("[AI-AGENT] HTTPException raised")
        raise
    except Exception as e:
        print(f"[AI-AGENT] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="I'm having trouble connecting to my AI systems right now. Please try again in a moment."
        )

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
            "sources": s.get("sources", []),
            "urlToImage": s.get("urlToImage", "")  # Include the image URL in the response
        }
        for s in unique_summaries
    ]

@router.get("/past_summaries")
async def get_past_summaries(topic: str = None):
    query = {}
    if topic:
        query["topic"] = topic    # Return all summaries for the topic, sorted by date descending
    past = list(summaries_collection.find(query).sort("date", -1))
    
    return [
        {
            "_id": str(s.get("_id")),
            "topic": s.get("topic"),
            "summary": s.get("summary"),
            "timestamp": s.get("date").isoformat() if s.get("date") else None,
            "title": s.get("title", ""),
            "sources": s.get("sources", []),
            "urlToImage": s.get("urlToImage", "")  # Include the image URL in the response
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

@router.post("/summaries/generate")
async def generate_summaries():
    """Manually trigger the generation of summaries"""
    try:
        # Import the function to generate summaries
        from app.utils.prefetch_job import prefetch_and_cache, check_todays_summaries
        
        # Check if summaries already exist for today
        existing_count = check_todays_summaries()
        
        if existing_count > 0:
            return {
                "success": False,
                "message": f"Summaries already exist for today ({existing_count} found)",
                "count": existing_count
            }
        
        # Generate new summaries
        result = prefetch_and_cache(force=True)
        
        # Check how many were generated
        new_count = check_todays_summaries()
        
        return {
            "success": True,
            "message": f"Successfully generated {new_count} summaries",
            "count": new_count
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return {
            "success": False,
            "message": f"Error generating summaries: {str(e)}",
            "error_details": error_details
        }

@router.get("/summaries/today")
async def get_todays_summaries():
    """Get all summaries generated for the current day (Central Time)"""
    # Calculate today's date range in Central Time
    central_tz = pytz.timezone('US/Central')
    now_central = datetime.now(central_tz)
    today_start_central = now_central.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end_central = now_central.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Since dates in database might be naive, we need to handle both cases
    # Convert to UTC for timezone-aware comparison
    today_start_utc = today_start_central.astimezone(pytz.UTC)
    today_end_utc = today_end_central.astimezone(pytz.UTC)
    
    # Also get naive versions for naive datetime comparison
    today_start_naive = today_start_central.replace(tzinfo=None)
    today_end_naive = today_end_central.replace(tzinfo=None)
    
    # Query for today's summaries using both timezone-aware and naive dates
    query = {
        "$or": [
            # Timezone-aware dates
            {
                "date": {
                    "$gte": today_start_utc,
                    "$lte": today_end_utc
                }
            },
            # Naive dates (assume they are in Central Time)
            {
                "date": {
                    "$gte": today_start_naive,
                    "$lte": today_end_naive
                }
            }
        ]
    }
      # Get today's summaries, sorted by timestamp (latest first)
    todays_summaries = list(summaries_collection.find(query).sort("date", -1))
    
    # Remove duplicates by checking title and content
    seen_titles = set()
    unique_summaries = []
    
    for s in todays_summaries:
        title = s.get("title", "").strip()
        summary = s.get("summary", "").strip()
        
        # Create a unique key using title and first 100 chars of summary
        unique_key = (title + summary[:100]) if title else summary[:100]
        
        if unique_key and unique_key not in seen_titles:
            seen_titles.add(unique_key)
            unique_summaries.append(s)
    
    return [
        {
            "_id": str(s.get("_id")),
            "title": s.get("title", ""),
            "summary": s.get("summary", ""),
            "topic": s.get("topic", ""),
            "date": s.get("date").isoformat() if s.get("date") else None,
            "sources": s.get("sources", []),
            "urlToImage": s.get("urlToImage", "")  # Include the image URL in the response
        }
        for s in unique_summaries
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
        "streak": result.get("streak", 0)
    }

@router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Return dashboard analytics for the current user"""
    analytics = get_user_dashboard_analytics(current_user["user_id"])
    if not analytics:
        raise HTTPException(status_code=404, detail="Dashboard data not found")
    return {"analytics": analytics}

@router.get("/users")
async def get_users(limit: int = 100, current_user: dict = Depends(get_current_user)):
    """Return a list of users for discovery"""
    users_data = get_all_users(current_user["user_id"], limit=limit)
    if users_data["success"] and "users" in users_data:
        return {"users": users_data["users"]}
    else:
        # Return empty array instead of None or invalid data
        return {"users": []}

@router.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    """Return profile info for a user"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    stats = get_user_stats(user_id)
    return {"user": {"user_id": user_id, "email": user["email"], "points": stats.get("points", 0) if stats else 0, "is_self": user_id == current_user["user_id"]}}

@router.get("/user/{user_id}/followers")
async def get_user_followers(user_id: str, current_user: dict = Depends(get_current_user)):
    """Return followers of a user"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    followers_data = get_user_followers(user_id)
    if followers_data["success"]:
        return followers_data
    else:
        raise HTTPException(status_code=500, detail=followers_data.get("error", "Failed to fetch followers"))

@router.get("/user/{user_id}/following")
async def get_user_following(user_id: str, current_user: dict = Depends(get_current_user)):
    """Return users that this user is following"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    following_data = get_user_following(user_id)
    if following_data["success"]:
        return following_data
    else:
        raise HTTPException(status_code=500, detail=following_data.get("error", "Failed to fetch following"))

@router.post("/follow/{target_user_id}")
async def follow(target_user_id: str, current_user: dict = Depends(get_current_user)):
    """Follow another user"""
    follow_user(current_user["user_id"], target_user_id)
    return {"status": "followed", "target_user_id": target_user_id}

@router.post("/unfollow/{target_user_id}")
async def unfollow(target_user_id: str, current_user: dict = Depends(get_current_user)):
    """Unfollow another user"""
    unfollow_user(current_user["user_id"], target_user_id)
    return {"status": "unfollowed", "target_user_id": target_user_id}