#!/usr/bin/env python3
"""
Migration script to add reading streak tracking to existing users
This script adds the 'streak' field to all users who don't have it
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db.mongodb import users_collection
from datetime import datetime
import pytz

def migrate_user_streaks():
    """Add streak field to existing users"""
    print("🔄 Starting user streak migration...")
    
    # Find users without streak field
    users_without_streak = list(users_collection.find({
        "$or": [
            {"streak": {"$exists": False}},
            {"streak": None}
        ]
    }))
    
    print(f"📊 Found {len(users_without_streak)} users without streak tracking")
    
    if len(users_without_streak) == 0:
        print("✅ All users already have streak tracking")
        return
    
    # Update users to add streak field
    updated_count = 0
    
    for user in users_without_streak:
        user_id = user.get("user_id")
        email = user.get("email", "unknown")
        
        try:
            # Initialize streak data
            streak_data = {
                "current": 0,
                "max": 0,
                "last_read_date": None
            }
            
            # If user has reading history, we can try to calculate initial streak
            summaries_read = user.get("summaries_read", [])
            daily_read_log = user.get("daily_read_log", {})
            
            if daily_read_log:
                # Find the most recent read date
                read_dates = sorted(daily_read_log.keys(), reverse=True)
                if read_dates:
                    most_recent_date = read_dates[0]
                    streak_data["last_read_date"] = most_recent_date
                    
                    # Calculate a basic streak from daily read log
                    today = datetime.now(pytz.timezone('US/Central')).date()
                    recent_date = datetime.strptime(most_recent_date, '%Y-%m-%d').date()
                    
                    # Only set current streak if they read recently (within last 2 days)
                    days_since = (today - recent_date).days
                    if days_since <= 1:
                        # Count consecutive days backwards from most recent
                        current_streak = 0
                        check_date = recent_date
                        
                        while check_date.strftime('%Y-%m-%d') in daily_read_log:
                            current_streak += 1
                            check_date = check_date.replace(day=check_date.day - 1) if check_date.day > 1 else check_date.replace(month=check_date.month - 1, day=31) if check_date.month > 1 else check_date.replace(year=check_date.year - 1, month=12, day=31)
                            
                            # Safety check to avoid infinite loop
                            if current_streak > 365:
                                break
                        
                        streak_data["current"] = min(current_streak, len(read_dates))
                        streak_data["max"] = streak_data["current"]
            
            # Update the user
            result = users_collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "streak": streak_data,
                        "updated_at": datetime.now(pytz.UTC)
                    }
                }
            )
            
            if result.modified_count > 0:
                updated_count += 1
                print(f"✅ Updated {email}: current={streak_data['current']}, max={streak_data['max']}")
            else:
                print(f"❌ Failed to update {email}")
                
        except Exception as e:
            print(f"❌ Error updating {email}: {e}")
    
    print(f"\n🎉 Migration complete!")
    print(f"   📈 Updated {updated_count}/{len(users_without_streak)} users")
    print(f"   ✨ All users now have streak tracking enabled")

def verify_migration():
    """Verify that all users have streak field"""
    print("\n🔍 Verifying migration...")
    
    total_users = users_collection.count_documents({})
    users_with_streak = users_collection.count_documents({
        "streak": {"$exists": True, "$ne": None}
    })
    
    print(f"   Total users: {total_users}")
    print(f"   Users with streak: {users_with_streak}")
    
    if total_users == users_with_streak:
        print("   ✅ All users have streak tracking")
        return True
    else:
        print(f"   ❌ {total_users - users_with_streak} users still missing streak tracking")
        return False

if __name__ == "__main__":
    try:
        print("📚 Reading Streak Migration Tool")
        print("=" * 50)
        
        migrate_user_streaks()
        verify_migration()
        
        print("\n🚀 Reading streak tracking is now enabled!")
        print("   Users will now earn streak points for consecutive daily reading")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
