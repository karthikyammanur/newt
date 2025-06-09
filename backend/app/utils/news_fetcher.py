import os
import requests
from dotenv import load_dotenv

load_dotenv()

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

def fetch_articles(topic: str, max_articles: int = 5):
    url = "https://gnews.io/api/v4/search"
    params = {
        "q": topic,
        "lang": "en",
        "max": max_articles,
        "token": GNEWS_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    articles = []
    for article in data.get("articles", []):
        articles.append({
            "id": article["url"],
            "title": article["title"],
            "content": f"{article.get('description', '')}\n{article.get('content', '')}"
        })

    return articles
