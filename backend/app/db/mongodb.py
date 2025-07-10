from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
import pytz
from bson import ObjectId
from typing import Optional, Dict, List

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

