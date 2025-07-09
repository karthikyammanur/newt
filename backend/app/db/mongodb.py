from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
import pytz

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/newt")
client = MongoClient(MONGO_URI)
db = client.get_default_database()

summaries_collection = db['summaries']


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

