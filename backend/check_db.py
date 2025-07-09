from app.db.mongodb import summaries_collection
import pymongo

count = summaries_collection.count_documents({})
print(f'Total summaries in database: {count}')

recent = list(summaries_collection.find().sort('date', pymongo.DESCENDING).limit(5))
print('\nRecent summaries:')
for s in recent:
    print(f'- {s["title"]} (Topic: {s["topic"]}, Date: {s["date"]})')
