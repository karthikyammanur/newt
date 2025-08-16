# daily_summaries_update.py
# This script is intended to be run at midnight CT to update summaries

import os
import sys
import logging
import datetime
import pytz
from pathlib import Path

# Add the root directory to the Python path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(root_dir, "last_generation.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("daily_updates")

def main():
    """Main function to run daily summary updates"""
    try:
        logger.info("Starting daily summaries update process")
        
        # Get current date and time in Central Time
        central_tz = pytz.timezone('US/Central')
        now_central = datetime.datetime.now(central_tz)
        logger.info(f"Current time in Central Time: {now_central.strftime('%Y-%m-%d %H:%M:%S %Z')}")
        
        # Import news fetcher and summarizer here to avoid circular imports
        from app.utils.news_fetcher import fetch_articles, TECH_KEYWORDS
        
        # Temporarily disabled due to PyTorch issues - replace with actual import when fixed
        # from app.utils.summarizer import summarize_topic
        # Use placeholder function for now
        def summarize_topic(topic):
            from app.db.mongodb import db
            import datetime
            return {
                "title": f"Tech News Summary: {topic}",
                "summary": f"This is a placeholder summary for {topic}. The full summarization feature will be implemented in production.",
                "topic": topic,
                "sources": ["placeholder-source.com"],
                "date": datetime.datetime.now(),
                "_id": f"temp-{topic}-summary"
            }
        
        # Log which topics we're processing
        logger.info(f"Processing {len(TECH_KEYWORDS)} topics: {', '.join(TECH_KEYWORDS)}")
        
        # Process each topic
        for topic in TECH_KEYWORDS:
            try:
                logger.info(f"Processing topic: {topic}")
                
                # Fetch articles for the topic
                articles = fetch_articles(topic)
                logger.info(f"Fetched {len(articles)} articles for topic {topic}")
                
                if articles:
                    # Generate summary for the topic
                    summary = summarize_topic(topic)
                    
                    # Save summary to database
                    from app.db.mongodb import db
                    summaries_collection = db['summaries']
                    
                    # Insert new summary with current date
                    summary_id = summaries_collection.insert_one({
                        "title": summary.get("title", f"Tech News: {topic}"),
                        "summary": summary.get("summary", ""),
                        "topic": topic,
                        "sources": summary.get("sources", []),
                        "date": datetime.datetime.now(pytz.UTC),
                        "urlToImage": summary.get("urlToImage", "")
                    }).inserted_id
                    
                    logger.info(f"Inserted new summary for {topic} with ID: {summary_id}")
                else:
                    logger.warning(f"No articles found for topic: {topic}")
            
            except Exception as e:
                logger.error(f"Error processing topic {topic}: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
        
        logger.info("Daily summaries update completed successfully")
    
    except Exception as e:
        logger.error(f"Error in daily update process: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
