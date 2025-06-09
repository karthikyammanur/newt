import os
from dotenv import load_dotenv
import google.generativeai as genai
from .retriever import ingest_articles, retrieve_relevant_articles

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
    sample_articles = [
        {"id": "1", "title": "News A", "content": "Some content about A."},
        {"id": "2", "title": "News B", "content": "Some content about B."},
        {"id": "3", "title": "News C", "content": "Some content about C."}
    ]

    ingest_articles(sample_articles)
    print(summarize_topic("News A", top_k=2))
