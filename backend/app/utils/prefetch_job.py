import os
import requests
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv
import google.generativeai as genai
from app.utils.news_fetcher import TECH_KEYWORDS, is_tech_related
from app.db.mongodb import db
import re

load_dotenv()

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

summaries_collection = db['summaries']

def fetch_latest_tech_articles(max_articles: int = 50):
    """Fetch all available tech articles from the last 24 hours"""
    
    # Calculate 24 hours ago in Central Time
    central_tz = pytz.timezone('US/Central')
    now_central = datetime.now(central_tz)
    yesterday_central = now_central - timedelta(days=1)
    
    # Convert to UTC for API (GNews expects UTC)
    yesterday_utc = yesterday_central.astimezone(pytz.UTC)
    from_date = yesterday_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    url = "https://gnews.io/api/v4/search"
    params = {
        "q": "technology",  # General tech query
        "lang": "en",
        "max": max_articles,
        "from": from_date,
        "sortby": "publishedAt",
        "token": GNEWS_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        articles = []
        for article in data.get("articles", []):
            # Combine title and content for keyword checking
            full_text = f"{article['title']} {article.get('description', '')} {article.get('content', '')}"
            
            # Only include if it's tech-related
            if is_tech_related(full_text):
                articles.append({
                    "title": article["title"],
                    "content": f"{article.get('description', '')}\n{article.get('content', '')}",
                    "url": article["url"],
                    "published_at": article.get("publishedAt", "")
                })
        
        print(f"Fetched {len(articles)} tech articles from the last 24 hours")
        return articles
        
    except Exception as e:
        print(f"Error fetching articles: {e}")
        return []

def generate_summary_and_topic(article: dict) -> dict:
    """Generate both summary and topic for a single article using Gemini"""
    
    prompt = f"""
You are a tech news analyzer. For the following tech article, you need to:

1. Generate a clear, informative title (if different from original)
2. Create a concise 1-2 paragraph summary
3. Classify it into ONE of these tech topics: AI, Machine Learning, Cybersecurity, Cloud Computing, Software Engineering, Data Science, Hardware, Startups, Web Development, Programming Languages, Semiconductors, Blockchain, IoT, DevOps, or Other

Article Title: {article['title']}
Article Content: {article['content']}

Return your response in this exact format:
TITLE: [generated title]
TOPIC: [single topic from the list above]
SUMMARY: [1-2 paragraph summary in plain text]
"""

    try:
        model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Parse the response
        lines = text.split('\n')
        title = article['title']  # fallback
        topic = "Other"  # fallback
        summary = ""
        
        current_section = None
        summary_lines = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('TITLE:'):
                title = line.replace('TITLE:', '').strip()
                current_section = 'title'
            elif line.startswith('TOPIC:'):
                topic = line.replace('TOPIC:', '').strip()
                current_section = 'topic'
            elif line.startswith('SUMMARY:'):
                summary_content = line.replace('SUMMARY:', '').strip()
                if summary_content:
                    summary_lines.append(summary_content)
                current_section = 'summary'
            elif current_section == 'summary' and line:
                summary_lines.append(line)
        
        summary = ' '.join(summary_lines).strip()
        
        # Clean up text
        title = re.sub(r'([\*_\-`#>|])', '', title).strip()
        summary = re.sub(r'([\*_\-`#>|]|\n\s*\n|\n\s*\*|\n\s*\d+\.|\n\s*\-|\n\s*\+)', ' ', summary)
        summary = re.sub(r'\s+', ' ', summary).strip()
        
        # Ensure topic is lowercase for consistency
        topic = topic.lower()
        
        return {
            "title": title,
            "topic": topic,
            "summary": summary
        }
        
    except Exception as e:
        print(f"Error generating summary and topic: {e}")
        return {
            "title": article['title'],
            "topic": "other",
            "summary": article['content'][:500] + "..." if len(article['content']) > 500 else article['content']
        }

def clear_todays_summaries():
    """Clear existing summaries from today to avoid duplicates"""
    central_tz = pytz.timezone('US/Central')
    today_central = datetime.now(central_tz).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Convert to UTC for MongoDB query
    today_utc = today_central.astimezone(pytz.UTC)
    
    result = summaries_collection.delete_many({
        "date": {"$gte": today_utc}
    })
    
    print(f"Cleared {result.deleted_count} existing summaries from today")

def prefetch_and_cache():
    """Main function to fetch articles, generate summaries, and store in MongoDB"""
    
    print(f"Starting daily prefetch job at {datetime.now()}")
    
    # Clear existing summaries from today
    clear_todays_summaries()
    
    # Fetch latest tech articles
    articles = fetch_latest_tech_articles(max_articles=100)  # Fetch more to get good variety
    
    if not articles:
        print("No articles found to process")
        return
    
    processed_count = 0
    
    for article in articles:
        try:
            # Generate summary and topic
            result = generate_summary_and_topic(article)
              # Prepare document for MongoDB with required schema
            doc = {
                "title": result["title"],
                "summary": result["summary"],
                "topic": result["topic"],
                "date": datetime.now(pytz.UTC),  # Store in UTC using timezone-aware datetime
                "sources": [article["url"]]
            }
            
            # Insert into MongoDB
            summaries_collection.insert_one(doc)
            processed_count += 1
            
            print(f"Processed article {processed_count}: {result['title']} (Topic: {result['topic']})")
            
        except Exception as e:
            print(f"Error processing article '{article['title']}': {e}")
            continue
    
    print(f"Prefetch job completed. Processed {processed_count} articles.")

if __name__ == "__main__":
    prefetch_and_cache()
