from app.utils.news_fetcher import fetch_articles
from app.utils.summarizer import summarize_topic
from app.utils.embedder import get_embedding
from app.db.mongodb import save_summary
from datetime import datetime

TOPICS = [
    'machine learning',
    'startups',
    'semiconductors',
    'hardware',
    'web development'
]

def prefetch_and_cache():
    for topic in TOPICS:
        articles = fetch_articles(topic, max_articles=5)
        if not articles:
            print(f"No articles for {topic}")
            continue
        summary = summarize_topic(topic, articles=articles)
        if not summary:
            print(f"No summary generated for {topic}")
            continue
        embedding = get_embedding(summary)
        save_summary(topic, summary, embedding, articles)
        print(f"Cached summary for {topic} at {datetime.utcnow()}")

if __name__ == "__main__":
    prefetch_and_cache()
