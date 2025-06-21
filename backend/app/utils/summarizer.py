import os
from dotenv import load_dotenv
import google.generativeai as genai
from app.utils.retriever import ingest_articles, retrieve_relevant_articles
from app.utils.news_fetcher import fetch_articles

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_topic(topic: str, top_k: int = 3) -> str:
    docs = retrieve_relevant_articles(topic, top_k)

    prompt = (
        "You are a tech-focused news analyst and summarizer.\n"
        f"Provide a comprehensive summary of the following {len(docs)} articles about \"{topic}\". "
        "Focus on:\n"
        "- Key technological developments and innovations\n"
        "- Technical details and specifications when relevant\n"
        "- Impact on the tech industry and developers\n"
        "- Future implications and potential developments\n\n"
        "Present the information in a clear, technical yet accessible style.\n\n"
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
    topic = "artificial intelligence"
    articles = fetch_articles(topic, max_articles=5)

    if not articles:
        print("No tech articles found.")
    else:
        ingest_articles(articles)
        summary = summarize_topic(topic)
        print("Tech News Summary:\n", summary)
