from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import pytz
from bson import ObjectId
from typing import Optional, Dict, List
from collections import defaultdict, Counter
import statistics

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
    user_doc = {
        "user_id": str(ObjectId()),
        "email": email,
        "hashed_password": hashed_password,
        "points": 0,
        "summaries_read": [],
        "daily_read_log": {},
        "created_at": datetime.now(pytz.UTC),
        "updated_at": datetime.now(pytz.UTC)
    }
    result = users_collection.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    return user_doc

def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email"""
    user = users_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user

def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by user_id"""
    user = users_collection.find_one({"user_id": user_id})
    if user:
        user["_id"] = str(user["_id"])
    return user

def update_user_read_log(user_id: str, summary_id: str) -> Dict:
    """Update user's read log when they read a summary"""
    today = datetime.now(pytz.timezone('US/Central')).strftime('%Y-%m-%d')
    
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
            "updated": update_result.modified_count > 0
        }
    else:
        return {"success": True, "already_read": True, "points_awarded": 0}

def get_user_stats(user_id: str) -> Optional[Dict]:
    """Get user statistics"""
    user = get_user_by_id(user_id)
    if not user:
        return None
    
    today = datetime.now(pytz.timezone('US/Central')).strftime('%Y-%m-%d')
    today_reads = user.get("daily_read_log", {}).get(today, 0)
    total_reads = len(user.get("summaries_read", []))
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "points": user.get("points", 0),
        "total_summaries_read": total_reads,
        "today_reads": today_reads,
        "daily_read_log": user.get("daily_read_log", {})
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
    reading_streak = calculate_reading_streak(daily_read_log)
    
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

def calculate_reading_streak(daily_read_log: Dict) -> Dict:
    """Calculate current and longest reading streak"""
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

