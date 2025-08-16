from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import pytz
from bson import ObjectId
from typing import Optional, Dict, List
from collections import defaultdict, Counter
import statistics
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("mongodb")

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/newt")
client = MongoClient(MONGO_URI)
db = client.get_default_database()

summaries_collection = db['summaries']
users_collection = db['users']


def save_summary(topic: str, summary: dict, embedding: list, articles: list):
    doc = {
        "topic": topic,
        "summary": summary.get("summary", ""),
        "title": summary.get("title", topic.title()),
        "sources": summary.get("sources", []),
        "urlToImage": summary.get("urlToImage", ""),  # Include the image URL
        "embedding": embedding,
        "articles": articles,
        "date": datetime.now(pytz.UTC)  # Use timezone-aware datetime
    }
    return summaries_collection.insert_one(doc)


def get_recent_summaries(limit: int = 10):
    return list(summaries_collection.find().sort("date", -1).limit(limit))

#get summaries by vector similarity (cosine)
def get_similar_summaries(embedding: list, limit: int = 3):
    import numpy as np
    all_summaries = list(summaries_collection.find())
    def cosine(a, b):
        a, b = np.array(a), np.array(b)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    scored = [(cosine(embedding, s["embedding"]), s) for s in all_summaries if s.get("embedding")]
    scored.sort(reverse=True, key=lambda x: x[0])
    return [s for _, s in scored[:limit]]

def get_mongo_client():
    return client

# User Management Functions
def create_user(email: str, hashed_password: str) -> Dict:
    """Create a new user in MongoDB"""
    try:
        # Check for duplicate users first
        if get_user_by_email(email):
            logger.warning(f"Attempted to create duplicate user: {email}")
            return None
            
        user_doc = {
            "user_id": str(ObjectId()),
            "email": email,
            "hashed_password": hashed_password,
            "points": 0,
            "summaries_read": [],
            "daily_read_log": {},
            "streak": {
                "current": 0,
                "max": 0,
                "last_read_date": None
            },
            "followers": [],
            "following": [],
            "created_at": datetime.now(pytz.UTC),
            "updated_at": datetime.now(pytz.UTC)
        }
        
        logger.info(f"Creating new user: {email}")
        result = users_collection.insert_one(user_doc)
        user_doc["_id"] = str(result.inserted_id)
        logger.info(f"User created successfully: {email} (ID: {user_doc['user_id']})")
        
        return user_doc
    except Exception as e:
        logger.error(f"Error creating user {email}: {str(e)}")
        return None

def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email"""
    try:
        logger.debug(f"Looking up user by email: {email}")
        user = users_collection.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
            logger.debug(f"User found: {email}")
            return user
        logger.debug(f"User not found: {email}")
        return None
    except Exception as e:
        logger.error(f"Error looking up user by email {email}: {str(e)}")
        return None

def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by user_id"""
    user = users_collection.find_one({"user_id": user_id})
    if user:
        user["_id"] = str(user["_id"])
    return user

def update_user_read_log(user_id: str, summary_id: str) -> Dict:
    """Update user's read log when they read a summary"""
    today = datetime.now(pytz.timezone('US/Central')).strftime('%Y-%m-%d')
    read_time = datetime.now(pytz.timezone('US/Central'))
    
    # Check if summary is already read to avoid duplicate points
    user = users_collection.find_one({"user_id": user_id})
    if not user:
        return {"success": False, "error": "User not found"}
    
    if summary_id in user.get("summaries_read", []):
        return {"success": True, "already_read": True, "points_awarded": 0}
    
    # Add summary to read list if not already there
    add_result = users_collection.update_one(
        {"user_id": user_id},
        {"$addToSet": {"summaries_read": summary_id}}
    )
      # Update daily read count and points only if summary was actually added
    if add_result.modified_count > 0:
        # Update reading streak
        streak_result = update_reading_streak(user_id, read_time)
        update_result = users_collection.update_one(
            {"user_id": user_id},
            {
                "$inc": {f"daily_read_log.{today}": 1, "points": 1},
                "$set": {"updated_at": datetime.now(pytz.UTC)}
            }
        )
        return {
            "success": True, 
            "already_read": False, 
            "points_awarded": 1,
            "updated": update_result.modified_count > 0,
            "streak": {
                "current": streak_result.get("current_streak", 0),
                "max": streak_result.get("max_streak", 0),
                "updated": streak_result.get("streak_updated", False)
            }
        }
    else:
        # Summary already read, get current streak info
        current_streak = user.get("streak", {"current": 0, "max": 0, "last_read_date": None})
        return {
            "success": True, 
            "already_read": True, 
            "points_awarded": 0,
            "streak": {
                "current": current_streak.get("current", 0),
                "max": current_streak.get("max", 0),
                "updated": False
            }
        }

def get_user_stats(user_id: str) -> Optional[Dict]:
    """Get user statistics"""
    user = get_user_by_id(user_id)
    if not user:
        return None
    
    today = datetime.now(pytz.timezone('US/Central')).strftime('%Y-%m-%d')
    today_reads = user.get("daily_read_log", {}).get(today, 0)
    total_reads = len(user.get("summaries_read", []))
    
    # Get streak data
    streak_data = user.get("streak", {"current": 0, "max": 0, "last_read_date": None})
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "points": user.get("points", 0),
        "total_summaries_read": total_reads,
        "today_reads": today_reads,
        "daily_read_log": user.get("daily_read_log", {}),
        "streak": streak_data
    }

def get_user_dashboard_analytics(user_id: str) -> Optional[Dict]:
    """Get comprehensive dashboard analytics for a user"""
    user = get_user_by_id(user_id)
    if not user:
        return None
    
    central = pytz.timezone('US/Central')
    
    # Basic stats
    total_summaries_read = len(user.get("summaries_read", []))
    total_points = user.get("points", 0)
    daily_read_log = user.get("daily_read_log", {})
    
    # Calculate average daily/weekly reads
    if daily_read_log:
        daily_counts = list(daily_read_log.values())
        avg_daily_reads = round(statistics.mean(daily_counts), 2)
        
        # Calculate weekly average (group days into weeks)
        weekly_totals = []
        sorted_dates = sorted(daily_read_log.keys())
        if sorted_dates:
            start_date = datetime.strptime(sorted_dates[0], '%Y-%m-%d').date()
            end_date = datetime.strptime(sorted_dates[-1], '%Y-%m-%d').date()
            
            current_week_start = start_date
            while current_week_start <= end_date:
                week_end = current_week_start + timedelta(days=6)
                week_total = 0
                
                for date_str, count in daily_read_log.items():
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                    if current_week_start <= date_obj <= week_end:
                        week_total += count
                
                if week_total > 0:  # Only count weeks with activity
                    weekly_totals.append(week_total)
                
                current_week_start = week_end + timedelta(days=1)
        
        avg_weekly_reads = round(statistics.mean(weekly_totals), 2) if weekly_totals else 0
    else:
        avg_daily_reads = 0
        avg_weekly_reads = 0
    
    # Get top liked topics by analyzing read summaries
    top_topics = get_user_top_topics(user_id)
      # Get most active time of day (mock data for now - would need read timestamps)
    most_active_time = get_user_active_time_analysis(user_id)
    
    # Reading streak calculation
    reading_streak = calculate_reading_streak(user)
    
    # Recent activity (last 7 days)
    recent_activity = get_recent_activity(daily_read_log, 7)
    
    return {
        "user_id": user_id,
        "total_summaries_read": total_summaries_read,
        "total_points": total_points,
        "avg_daily_reads": avg_daily_reads,
        "avg_weekly_reads": avg_weekly_reads,
        "top_topics": top_topics,
        "most_active_time": most_active_time,
        "reading_streak": reading_streak,
        "recent_activity": recent_activity,
        "daily_read_log": daily_read_log
    }

def get_user_top_topics(user_id: str, limit: int = 5) -> List[Dict]:
    """Get user's most read topics"""
    user = get_user_by_id(user_id)
    if not user:
        return []
    
    summaries_read = user.get("summaries_read", [])
    if not summaries_read:
        return []
    
    # Get topics for read summaries
    topic_counts = Counter()
    
    for summary_id in summaries_read:
        try:
            summary = summaries_collection.find_one({"_id": ObjectId(summary_id)})
            if summary and summary.get("topic"):
                topic_counts[summary["topic"]] += 1
        except:
            continue  # Skip invalid ObjectIds
    
    # Convert to list of dicts with percentages
    total_reads = sum(topic_counts.values())
    top_topics = []
    
    for topic, count in topic_counts.most_common(limit):
        percentage = round((count / total_reads) * 100, 1) if total_reads > 0 else 0
        top_topics.append({
            "topic": topic,
            "count": count,
            "percentage": percentage
        })
    
    return top_topics

def get_user_active_time_analysis(user_id: str) -> Dict:
    """Analyze most active reading times (simplified version)"""
    # For now, return mock data based on typical patterns
    # In a real implementation, you'd store read timestamps
    
    user = get_user_by_id(user_id)
    if not user:
        return {"hour": 9, "period": "morning", "description": "9:00 AM"}
    
    # Mock analysis based on user activity
    total_reads = len(user.get("summaries_read", []))
    
    if total_reads < 5:
        return {"hour": 9, "period": "morning", "description": "9:00 AM"}
    elif total_reads < 15:
        return {"hour": 14, "period": "afternoon", "description": "2:00 PM"}
    else:
        return {"hour": 19, "period": "evening", "description": "7:00 PM"}

def calculate_reading_streak(user_data: Dict) -> Dict:
    """Calculate current and longest reading streak using new streak field"""
    # First try to get streak data from the new field
    streak_data = user_data.get("streak")
    if streak_data and isinstance(streak_data, dict):
        current = streak_data.get("current", 0)
        longest = streak_data.get("max", 0)
        
        # Validate current streak by checking if last read was recent
        last_read_date = streak_data.get("last_read_date")
        if last_read_date:
            try:
                if isinstance(last_read_date, str):
                    last_date = datetime.strptime(last_read_date, '%Y-%m-%d').date()
                elif isinstance(last_read_date, datetime):
                    last_date = last_read_date.date()
                else:
                    last_date = None
                
                if last_date:
                    today = datetime.now(pytz.timezone('US/Central')).date()
                    days_since = (today - last_date).days
                    
                    # If more than 1 day since last read, reset current streak
                    if days_since > 1:
                        current = 0
            except:
                # If date parsing fails, keep the stored values
                pass
        
        return {"current": current, "longest": longest}
    
    # Fallback to old calculation method using daily_read_log
    daily_read_log = user_data.get("daily_read_log", {})
    if not daily_read_log:
        return {"current": 0, "longest": 0}
    
    # Sort dates
    sorted_dates = sorted([
        datetime.strptime(date_str, '%Y-%m-%d').date() 
        for date_str in daily_read_log.keys()
    ])
    
    if not sorted_dates:
        return {"current": 0, "longest": 0}
    
    current_streak = 0
    longest_streak = 0
    temp_streak = 1
    
    today = datetime.now(pytz.timezone('US/Central')).date()
    
    # Calculate current streak (working backwards from today)
    for i in range(len(sorted_dates)):
        check_date = today - timedelta(days=i)
        if check_date in sorted_dates:
            current_streak += 1
        else:
            break
    
    # Calculate longest streak
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i-1]).days == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
    
    longest_streak = max(longest_streak, temp_streak)
    
    return {"current": current_streak, "longest": longest_streak}

def get_recent_activity(daily_read_log: Dict, days: int = 7) -> List[Dict]:
    """Get reading activity for the last N days"""
    central = pytz.timezone('US/Central')
    today = datetime.now(central).date()
    
    recent_activity = []
    
    for i in range(days):
        date = today - timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        count = daily_read_log.get(date_str, 0)
        
        recent_activity.append({
            "date": date_str,
            "day_name": date.strftime('%A'),
            "reads": count
        })
    
    return list(reversed(recent_activity))  # Oldest first

# Follow/Unfollow Functions
def follow_user(follower_id: str, target_user_id: str) -> Dict:
    """Follow a user"""
    # Check if both users exist
    follower = get_user_by_id(follower_id)
    target_user = get_user_by_id(target_user_id)
    
    if not follower:
        return {"success": False, "error": "Follower user not found"}
    if not target_user:
        return {"success": False, "error": "Target user not found"}
    if follower_id == target_user_id:
        return {"success": False, "error": "Cannot follow yourself"}
    
    # Check if already following
    if target_user_id in follower.get("following", []):
        return {"success": False, "error": "Already following this user"}
    
    # Add to follower's following list
    users_collection.update_one(
        {"user_id": follower_id},
        {
            "$addToSet": {"following": target_user_id},
            "$set": {"updated_at": datetime.now(pytz.UTC)}
        }
    )
    
    # Add to target user's followers list
    users_collection.update_one(
        {"user_id": target_user_id},
        {
            "$addToSet": {"followers": follower_id},
            "$set": {"updated_at": datetime.now(pytz.UTC)}
        }
    )
    
    return {"success": True, "message": "Successfully followed user"}

def unfollow_user(follower_id: str, target_user_id: str) -> Dict:
    """Unfollow a user"""
    # Check if both users exist
    follower = get_user_by_id(follower_id)
    target_user = get_user_by_id(target_user_id)
    
    if not follower:
        return {"success": False, "error": "Follower user not found"}
    if not target_user:
        return {"success": False, "error": "Target user not found"}
    if follower_id == target_user_id:
        return {"success": False, "error": "Cannot unfollow yourself"}
    
    # Check if not following
    if target_user_id not in follower.get("following", []):
        return {"success": False, "error": "Not following this user"}
    
    # Remove from follower's following list
    users_collection.update_one(
        {"user_id": follower_id},
        {
            "$pull": {"following": target_user_id},
            "$set": {"updated_at": datetime.now(pytz.UTC)}
        }
    )
    
    # Remove from target user's followers list
    users_collection.update_one(
        {"user_id": target_user_id},
        {
            "$pull": {"followers": follower_id},
            "$set": {"updated_at": datetime.now(pytz.UTC)}
        }
    )
    
    return {"success": True, "message": "Successfully unfollowed user"}

def get_user_followers(user_id: str) -> Dict:
    """Get list of user's followers with their details"""
    user = get_user_by_id(user_id)
    if not user:
        return {"success": False, "error": "User not found"}
    
    follower_ids = user.get("followers", [])
    followers = []
    
    for follower_id in follower_ids:
        follower = get_user_by_id(follower_id)
        if follower:
            followers.append({
                "user_id": follower["user_id"],
                "email": follower["email"],
                "points": follower.get("points", 0),
                "total_summaries_read": len(follower.get("summaries_read", [])),
                "created_at": follower["created_at"]
            })
    
    return {
        "success": True,
        "followers": followers,
        "follower_count": len(followers)
    }

def get_user_following(user_id: str) -> Dict:
    """Get list of users that this user is following with their details"""
    user = get_user_by_id(user_id)
    if not user:
        return {"success": False, "error": "User not found"}
    
    following_ids = user.get("following", [])
    following = []
    
    for following_id in following_ids:
        followed_user = get_user_by_id(following_id)
        if followed_user:
            following.append({
                "user_id": followed_user["user_id"],
                "email": followed_user["email"],
                "points": followed_user.get("points", 0),
                "total_summaries_read": len(followed_user.get("summaries_read", [])),
                "created_at": followed_user["created_at"]
            })
    
    return {
        "success": True,
        "following": following,
        "following_count": len(following)
    }

def get_all_users(current_user_id: str = None, limit: int = 50) -> Dict:
    """Get list of all users for discovery (excluding current user)"""
    query = {}
    if current_user_id:
        query["user_id"] = {"$ne": current_user_id}
    
    users = list(users_collection.find(query).limit(limit))
    user_list = []
    
    for user in users:
        user_list.append({
            "user_id": user["user_id"],
            "email": user["email"],
            "points": user.get("points", 0),
            "total_summaries_read": len(user.get("summaries_read", [])),
            "follower_count": len(user.get("followers", [])),
            "following_count": len(user.get("following", [])),
            "created_at": user["created_at"]
        })
    
    return {
        "success": True,
        "users": user_list,
        "total_count": len(user_list)
    }

def update_reading_streak(user_id: str, read_date: datetime) -> Dict:
    """Update user's reading streak based on read date"""
    user = users_collection.find_one({"user_id": user_id})
    if not user:
        return {"success": False, "error": "User not found"}
    
    # Get current streak data, with defaults if not present (for existing users)
    current_streak = user.get("streak", {})
    if not current_streak:
        current_streak = {"current": 0, "max": 0, "last_read_date": None}
    
    current_count = current_streak.get("current", 0)
    max_count = current_streak.get("max", 0)
    last_read_date = current_streak.get("last_read_date")
    
    # Convert read_date to Central timezone date string for comparison
    central_tz = pytz.timezone('US/Central')
    read_date_central = read_date.astimezone(central_tz).date()
    read_date_str = read_date_central.strftime('%Y-%m-%d')
    
    # Determine if this is a consecutive day
    if last_read_date:
        # Parse the last read date
        if isinstance(last_read_date, str):
            last_date = datetime.strptime(last_read_date, '%Y-%m-%d').date()
        elif isinstance(last_read_date, datetime):
            last_date = last_read_date.date()
        else:
            # Handle any other format by resetting
            last_date = None
        
        if last_date:
            days_diff = (read_date_central - last_date).days
            
            if days_diff == 0:
                # Same day - no change to streak
                return {
                    "success": True,
                    "streak_updated": False,
                    "current_streak": current_count,
                    "max_streak": max_count
                }
            elif days_diff == 1:
                # Consecutive day - increment streak
                current_count += 1
            else:
                # Gap in reading - reset streak to 1
                current_count = 1
        else:
            # Invalid last date - reset streak
            current_count = 1
    else:
        # First time reading - start streak
        current_count = 1
    
    # Update max streak if current exceeds it
    max_count = max(max_count, current_count)
    
    # Update user's streak in database
    update_result = users_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "streak.current": current_count,
                "streak.max": max_count,
                "streak.last_read_date": read_date_str,
                "updated_at": datetime.now(pytz.UTC)
            }
        }
    )
    
    return {
        "success": True,
        "streak_updated": True,
        "current_streak": current_count,
        "max_streak": max_count,
        "updated": update_result.modified_count > 0
    }

