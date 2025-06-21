import os
from dotenv import load_dotenv
import google.generativeai as genai
from app.utils.retriever import ingest_articles, retrieve_relevant_articles
from app.utils.news_fetcher import fetch_articles
import re

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_topic(topic: str, top_k: int = 3, articles: list = None) -> str:
    #if articles are provided, use them; otherwise, retrieve relevant ones
    docs = articles if articles is not None else retrieve_relevant_articles(topic, top_k)
    if not docs:
        return None

    prompt = (
        "You are a tech-focused news analyst and summarizer.\n"
        f"Summarize the following {len(docs)} articles about '{topic}' in 1-2 short, well-structured paragraphs. "
        "Do NOT use bullet points, lists, or headings.\n"
        "Write in clear, plain English.\n"
        "At the end, add a line: Sources: <comma-separated article titles>.\n"
        "Do not use markdown formatting (no *, **, or _).\n\n"
    )

    for i, d in enumerate(docs):
        prompt += (
            f"Article {i+1}:\n"
            f"Title: {d['title']}\n"
            f"Content: {d['content']}\n\n"
        )

    model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
    response = model.generate_content(prompt)
    summary = response.text.strip()

    #remove markdown bold/italic for plain text rendering
    summary = re.sub(r'[\*_]{1,2}', '', summary)
    return summary

if __name__ == "__main__":
    topic = "artificial intelligence"
    articles = fetch_articles(topic, max_articles=5)

    if not articles:
        print("No tech articles found.")
    else:
        ingest_articles(articles)
        summary = summarize_topic(topic, articles=articles)
        print("Tech News Summary:\n", summary)
