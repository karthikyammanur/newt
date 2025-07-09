from app.db.mongodb import summaries_collection
import pymongo

print("Testing MongoDB topic field implementation...")
recent = list(summaries_collection.find().sort('date', pymongo.DESCENDING).limit(5))

print(f"\nFound {len(recent)} recent summaries:")
for i, s in enumerate(recent):
    print(f"\n{i+1}. Title: {s['title']}")
    print(f"   Topic: {s['topic']}")
    print(f"   Date: {s['date']}")
    print(f"   Sources: {len(s.get('sources', []))} source(s)")
