from app.utils.prefetch_job import prefetch_and_cache
from apscheduler.schedulers.blocking import BlockingScheduler
import pytz
from datetime import datetime

def run_daily():
    # Enhanced logging with timezone-aware timestamps
    central_tz = pytz.timezone('America/Chicago')
    utc_now = datetime.utcnow()
    central_time = pytz.utc.localize(utc_now).astimezone(central_tz)
    
    print(f"[newt] Running daily summary job at {central_time.strftime('%Y-%m-%d %H:%M:%S %Z')} (Central Time)")
    print(f"[newt] UTC time: {utc_now.strftime('%Y-%m-%d %H:%M:%S')} UTC")
    
    try:
        prefetch_and_cache()
        print(f"[newt] Daily summary job completed successfully at {central_time.strftime('%H:%M:%S %Z')}")
    except Exception as e:
        print(f"[newt] Error in daily summary job: {e}")

if __name__ == "__main__":
    # Use Central Time timezone for the scheduler
    central_tz = pytz.timezone('America/Chicago')
    scheduler = BlockingScheduler(timezone=central_tz)
    
    # Schedule for midnight Central Time
    scheduler.add_job(run_daily, 'cron', hour=0, minute=0)
    
    current_time = datetime.now(central_tz)
    print(f"[newt] Daily summary job scheduled for midnight Central Time (00:00 America/Chicago)")
    print(f"[newt] Current Central Time: {current_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"[newt] Scheduler started and waiting for next execution...")
    
    scheduler.start()
