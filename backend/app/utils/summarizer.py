import os
from dotenv import load_dotenv
import google.generativeai as genai
from backend.app.utils.retriever import ingest_articles, retrieve_relevant_articles
from backend.app.utils.news_fetcher import fetch_articles
from backend.app.db.likes_db import init_db, like_topic, get_liked_topics

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_topic(topic: str, top_k: int = 3) -> str:
    docs = retrieve_relevant_articles(topic, top_k)

    prompt = (
        "You are a neutral, fact-based news summarizer.\n"
        f"Summarize the following {len(docs)} articles about \"{topic}\" "
        "in a balanced and unbiased way, reflecting all perspectives.\n\n"
    )

    for i, d in enumerate(docs):
        prompt += (

            f"Article {i+1}:\n"
            f"Title: {d['title']}\n"
            f"Content: {d['content']}\n\n"
        )

    model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
    response = model.generate_content(prompt)
    return response.text.strip()

if __name__ == "__main__":
    from backend.app.utils.news_fetcher import fetch_articles
    from backend.app.db.likes_db import init_db, like_topic, get_liked_topics


    init_db()

    topic = "US presidential election"
    articles = fetch_articles(topic, max_articles=5)

    if not articles:
        print("No articles found.")
    else:
        ingest_articles(articles)
        summary = summarize_topic(topic, top_k=3)
        print("📰 Summary:\n", summary)

        like_topic(topic)
        print(f"Liked topic: {topic}")
        print("Your liked topics:", get_liked_topics())

