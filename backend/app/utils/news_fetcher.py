import os
import requests
from dotenv import load_dotenv

load_dotenv()

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

#tech related keywords for filtering
TECH_KEYWORDS = {
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
    'software', 'programming', 'developer', 'coding', 'computer science',
    'data science', 'technology', 'tech', 'cybersecurity', 'cloud computing',
    'blockchain', 'robotics', 'automation', 'quantum computing', 'devops',
    'hardware', 'software engineering', 'computer vision', 'nlp', 'api',
    '5g', 'iot', 'internet of things', 'startup', 'innovation'
}

def is_tech_related(text: str) -> bool:
    """Check if the article is tech-related based on its content."""
    text = text.lower()
    return any(keyword in text for keyword in TECH_KEYWORDS)

def fetch_articles(topic: str, max_articles: int = 5):
    tech_topic = f"technology {topic}"
    
    url = "https://gnews.io/api/v4/search"
    params = {
        "q": tech_topic,
        "lang": "en",
        "max": max_articles * 2,
        "topic": "technology",  #im using the gnews technology category
        "token": GNEWS_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    articles = []
    for article in data.get("articles", []):
        #combine title and content for keyword checking
        full_text = f"{article['title']} {article.get('description', '')} {article.get('content', '')}"
          #only include it if its tech-related
        if is_tech_related(full_text):
            articles.append({
                "id": article["url"],
                "title": article["title"],
                "content": f"{article.get('description', '')}\n{article.get('content', '')}",
                "urlToImage": article.get("image", "")  # Include the image URL from GNews API
            })
            
            if len(articles) >= max_articles:
                break

    return articles
