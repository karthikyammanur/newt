import os
from dotenv import load_dotenv
import google.generativeai as genai
from app.utils.retriever import ingest_articles, retrieve_relevant_articles
from app.utils.news_fetcher import fetch_articles
import re

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_topic(topic: str, top_k: int = 3, articles: list = None) -> dict:
    docs = articles if articles is not None else retrieve_relevant_articles(topic, top_k)
    if not docs:
        return {"title": topic.title(), "summary": "", "sources": []}

    prompt = (
        "You are a tech news summarizer.\n"
        f"Summarize the following {len(docs)} articles about '{topic}' in 1-2 short, well-structured paragraphs. "
        "First, generate a short, relevant, plain-text title for the summary (no formatting, no quotes, no markdown, no lists, no bold, no headings).\n"
        "On the next line, write the summary in clear, plain English, as a single block of text.\n"
        "At the end, add a line: Sources: <comma-separated article URLs>.\n"
        "Return only the title, summary, and sources, nothing else.\n\n"
    )
    for i, d in enumerate(docs):
        prompt += (
            f"Article {i+1}:\n"
            f"Title: {d['title']}\n"
            f"Content: {d['content']}\n"
            f"URL: {d.get('id', '')}\n\n"
        )
    model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
    response = model.generate_content(prompt)
    text = response.text.strip()

    # Extract title, summary, and sources
    title = topic.title()
    summary = text
    sources = []
    lines = [l for l in text.split('\n') if l.strip()]
    if lines and len(lines) > 1:
        title = lines[0].strip()
        sources_line = next((l for l in lines if l.lower().startswith('sources:')), None)
        if sources_line:
            sources = [s.strip() for s in sources_line.replace('Sources:', '').split(',') if s.strip()]
            summary = '\n'.join(l for l in lines[1:] if not l.lower().startswith('sources:')).strip()
        else:
            summary = '\n'.join(lines[1:]).strip()
    # Remove markdown, lists, and extra whitespace
    summary = re.sub(r'([\*_\-`#>|]|\n\s*\n|\n\s*\*|\n\s*\d+\.|\n\s*\-|\n\s*\+)', ' ', summary)
    summary = re.sub(r'\s+', ' ', summary).strip()
    title = re.sub(r'([\*_\-`#>|])', '', title).strip()
    return {"title": title, "summary": summary, "sources": sources}

if __name__ == "__main__":
    topic = "artificial intelligence"
    articles = fetch_articles(topic, max_articles=5)

    if not articles:
        print("No tech articles found.")
        print(articles)
    else:
        ingest_articles(articles)
        summary = summarize_topic(topic, articles=articles)
        print("Tech News Summary:\n", summary)
