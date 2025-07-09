"""
Daily Scheduler for News Prefetch Job

This script demonstrates how to run the prefetch job daily at midnight Central Time.
You can use this with various scheduling systems:

1. Windows Task Scheduler
2. Python APScheduler
3. Cron (on Linux/Mac)
4. Cloud Functions/Lambda with cron triggers

For Windows Task Scheduler:
- Create a new task
- Set trigger to daily at 12:00 AM Central Time
- Set action to run: python c:\Users\coolk\ai-news-summarizer\backend\app\utils\prefetch_job.py
"""

import schedule
import time
import pytz
from datetime import datetime
from app.utils.prefetch_job import prefetch_and_cache

def job():
    """Wrapper function for the prefetch job"""
    print(f"Running scheduled prefetch job at {datetime.now()}")
    try:
        prefetch_and_cache()
        print("Scheduled job completed successfully")
    except Exception as e:
        print(f"Error in scheduled job: {e}")

def run_scheduler():
    """Run the scheduler to execute job daily at midnight Central Time"""
    
    # Schedule the job for midnight Central Time
    # Note: schedule library runs in local time, so adjust accordingly
    schedule.every().day.at("00:00").do(job)
    
    print("Scheduler started. Waiting for midnight Central Time...")
    print("Press Ctrl+C to stop the scheduler")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    # For testing, you can run the job immediately
    print("Running prefetch job immediately for testing...")
    job()
    
    # Uncomment the line below to start the actual scheduler
    # run_scheduler()
