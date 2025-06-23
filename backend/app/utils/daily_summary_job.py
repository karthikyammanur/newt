from app.utils.prefetch_job import prefetch_and_cache
from apscheduler.schedulers.blocking import BlockingScheduler
import pytz
from datetime import datetime

def run_daily():
    print(f"[newt] Running daily summary job at {datetime.now()}")
    prefetch_and_cache()

if __name__ == "__main__":
    scheduler = BlockingScheduler(timezone=pytz.UTC)
    scheduler.add_job(run_daily, 'cron', hour=0, minute=0)
    print("[newt] Daily summary job scheduled for midnight UTC.")
    scheduler.start()
