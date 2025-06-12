import os
import json
from typing import List, Dict
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from dotenv import load_dotenv
from backend.app.utils.embedder import get_embedding

load_dotenv()

USER_DATA_PATH = "backend/app/db/user_data.json"

def ensure_user_data():
    if not os.path.exists(USER_DATA_PATH):
        with open(USER_DATA_PATH, 'w') as f:
            json.dump({}, f)

#like article and store full content per user
def like_article(user_id: str, article: Dict):
    ensure_user_data()
    with open(USER_DATA_PATH, 'r+') as f:
        data = json.load(f)
        if user_id not in data:
            data[user_id] = {"liked_articles": []}
        data[user_id]["liked_articles"].append(article)
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()

#embed liked articles for a user
def store_user_embedding(user_id: str):
    ensure_user_data()
    with open(USER_DATA_PATH, 'r+') as f:
        data = json.load(f)
        if user_id not in data or not data[user_id].get("liked_articles"):
            return

        embeddings = []
        for article in data[user_id]["liked_articles"]:
            text = article["title"] + ". " + article["content"]
            embeddings.append(get_embedding(text))

        avg_embedding = np.mean(embeddings, axis=0).tolist()
        data[user_id]["user_embedding"] = avg_embedding
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()

#recommend new articles to a user
def recommend_articles(user_id: str, articles: List[Dict], threshold: float = 0.85):
    ensure_user_data()
    with open(USER_DATA_PATH, 'r') as f:
        data = json.load(f)
        user_embedding = data.get(user_id, {}).get("user_embedding")
        if not user_embedding:
            return []

    user_embedding = np.array(user_embedding).reshape(1, -1)
    recommended = []

    for article in articles:
        text = article["title"] + ". " + article["content"]
        emb = get_embedding(text).reshape(1, -1)
        score = cosine_similarity(user_embedding, emb)[0][0]
        if score >= threshold:
            recommended.append({"score": score, **article})

    return sorted(recommended, key=lambda x: x["score"], reverse=True)

#testing the recommendation engine
if __name__ == "__main__":
    sample_articles = [
        {"id": "1", "title": "Solar Power Growth", "content": "Solar energy is expanding rapidly in the US and abroad."},
        {"id": "2", "title": "AI in Healthcare", "content": "AI is revolutionizing diagnostics and treatment plans."},
        {"id": "3", "title": "Climate Policy Update", "content": "New climate policies are being introduced to cut emissions."}
    ]

    user = "karthik"
    for article in sample_articles[:2]:
        like_article(user, article)
    store_user_embedding(user)

    print("Recommended Articles:")
    recs = recommend_articles(user, sample_articles)
    for r in recs:
        print(f"\nTitle: {r['title']}\nScore: {r['score']:.3f}\nContent: {r['content']}")
