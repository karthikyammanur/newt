from app.db.likes_db import get_liked_topics
from app.utils.news_fetcher import fetch_articles
from app.utils.retriever import ingest_articles
from app.utils.summarizer import summarize_topic
from app.utils.embedder import get_embedding
from app.db.mongodb import get_similar_summaries
from typing import List, Dict, Any

def generate_tech_news_digest():
    """Generate a personalized tech news digest based on user's liked topics."""
    liked_topics = get_liked_topics()

    if not liked_topics:
        print("No tech topics found in your preferences. Like some tech topics first!")
        return

    print("Generating Your Tech News Digest")
    print(f"Fetching tech updates for your interests: {', '.join(liked_topics)}\n")

    all_articles = []

    for topic in liked_topics:
        articles = fetch_articles(topic, max_articles=3)
        if articles:
            all_articles.extend(articles)
            print(f"Found {len(articles)} tech articles about {topic}")

    if not all_articles:
        print("\n No relevant tech articles found for your topics.")
        return

    ingest_articles(all_articles)

    print("\n Your Tech News Summaries")
    
    for topic in liked_topics:
        print(f"\nTech Updates: {topic}")
        try:
            summary = summarize_topic(f"technology {topic}", top_k=3)
            print(f"{summary}\n")
        except Exception as e:
            print(f"Failed to summarize {topic}: {e}\n")

def get_personalized_feed(user_id: str, summaries_per_topic: int = 2) -> List[Dict[str, Any]]:
    """
    Get personalized feed for a user based on their liked topics.
    Uses pre-cached summaries from MongoDB.
    """
    #just use get_liked_topics - theres no per-user support
    liked_topics = get_liked_topics()
    if not liked_topics:
        return []

    all_summaries = []
    for topic in liked_topics:
        topic_embedding = get_embedding(topic)
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
    generate_tech_news_digest()