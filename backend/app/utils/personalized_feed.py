from backend.app.db.likes_db import get_liked_topics
from backend.app.utils.news_fetcher import fetch_articles
from backend.app.utils.retriever import ingest_articles
from backend.app.utils.summarizer import summarize_topic

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

if __name__ == "__main__":
    generate_tech_news_digest()