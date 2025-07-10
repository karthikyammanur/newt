"""
Database migration script to add follow/unfollow fields to existing users
Run this script to update existing user documents with the new followers/following fields
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

load_dotenv()

def migrate_user_schema():
    """Add followers and following fields to existing users"""
    
    # Connect to MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/newt")
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    users_collection = db['users']
    
    print("🔄 Starting user schema migration...")
    print(f"📁 Connected to database: {db.name}")
    
    # Find users that don't have the new fields
    users_without_follow_fields = users_collection.find({
        "$or": [
            {"followers": {"$exists": False}},
            {"following": {"$exists": False}}
        ]
    })
    
    users_to_update = list(users_without_follow_fields)
    
    if not users_to_update:
        print("✅ All users already have follow/unfollow fields. No migration needed.")
        return
    
    print(f"📊 Found {len(users_to_update)} users that need migration")
    
    # Update users with new fields
    update_count = 0
    for user in users_to_update:
        result = users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "followers": user.get("followers", []),
                    "following": user.get("following", [])
                }
            }
        )
        
        if result.modified_count > 0:
            update_count += 1
            print(f"   ✅ Updated user: {user.get('email', 'Unknown')}")
    
    print(f"\n🎉 Migration complete!")
    print(f"   - Total users processed: {len(users_to_update)}")
    print(f"   - Users updated: {update_count}")
    
    # Verify migration
    print("\n🔍 Verifying migration...")
    total_users = users_collection.count_documents({})
    users_with_follow_fields = users_collection.count_documents({
        "followers": {"$exists": True},
        "following": {"$exists": True}
    })
    
    print(f"   - Total users: {total_users}")
    print(f"   - Users with follow fields: {users_with_follow_fields}")
    
    if total_users == users_with_follow_fields:
        print("   ✅ All users now have follow/unfollow fields!")
    else:
        print("   ⚠️  Some users may still be missing follow fields")
    
    client.close()

if __name__ == "__main__":
    try:
        migrate_user_schema()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
