from app.db.likes_db import get_liked_articles
from app.utils.news_fetcher import fetch_articles
from app.utils.retriever import ingest_articles
from app.utils.summarizer import summarize_topic
from app.utils.embedder import get_embedding
from app.db.mongodb import get_similar_summaries
from typing import List, Dict, Any

def generate_tech_news_digest(user_id: str):
    """Generate a personalized tech news digest based on user's liked articles."""
    liked_articles = get_liked_articles(user_id)

    if not liked_articles:
        print("No liked articles found for this user.")
        return

    print(f"Generating Tech News Digest for user {user_id}")
    print(f"Liked articles: {liked_articles}\n")

    all_articles = []

    for article_id in liked_articles:
        articles = fetch_articles(article_id, max_articles=3)
        if articles:
            all_articles.extend(articles)
            print(f"Found {len(articles)} tech articles about {article_id}")

    if not all_articles:
        print("\n No relevant tech articles found for your topics.")
        return

    ingest_articles(all_articles)

    print("\n Your Tech News Summaries")
    
    for article_id in liked_articles:
        print(f"\nTech Updates: {article_id}")
        try:
            summary = summarize_topic(f"technology {article_id}", top_k=3)
            print(f"{summary}\n")
        except Exception as e:
            print(f"Failed to summarize {article_id}: {e}\n")

def get_personalized_feed(user_id: str, summaries_per_topic: int = 2) -> List[Dict[str, Any]]:
    """
    Get personalized feed for a user based on their liked articles.
    Uses pre-cached summaries from MongoDB.
    """
    liked_articles = get_liked_articles(user_id)
    if not liked_articles:
        return []

    all_summaries = []
    for article_id in liked_articles:
        topic_embedding = get_embedding(article_id)
        similar_summaries = get_similar_summaries(topic_embedding, limit=summaries_per_topic)
        all_summaries.extend(similar_summaries)

    #remove duplicates
    seen = set()
    unique_summaries = []
    for s in all_summaries:
        sid = str(s.get('_id'))
        if sid not in seen:
            seen.add(sid)
            unique_summaries.append(s)

    unique_summaries.sort(key=lambda x: x.get('date', ''), reverse=True)
    return unique_summaries

if __name__ == "__main__":
    generate_tech_news_digest("testuser@example.com")