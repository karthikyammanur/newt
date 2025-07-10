#!/usr/bin/env python3
"""
Test the dashboard analytics function directly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db.mongodb import get_user_dashboard_analytics

def test_analytics():
    # Test with the known test user ID 
    user_id = "686eff0514438239a7992853"  # This is the test user ID from previous tests
    
    try:
        print("Testing dashboard analytics...")
        analytics = get_user_dashboard_analytics(user_id)
        
        if analytics:
            print("✅ Analytics retrieved successfully!")
            print(f"User ID: {analytics['user_id']}")
            print(f"Total reads: {analytics['total_summaries_read']}")
            print(f"Total points: {analytics['total_points']}")
            print(f"Avg daily reads: {analytics['avg_daily_reads']}")
            print(f"Top topics: {len(analytics['top_topics'])} topics")
            print(f"Reading streak: {analytics['reading_streak']}")
            print(f"Recent activity: {len(analytics['recent_activity'])} days")
        else:
            print("❌ Analytics returned None")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analytics()
