import requests
from datetime import datetime
import pytz

print("=== TESTING /summaries/today ENDPOINT ===\n")

# Test the new endpoint
try:
    response = requests.get("http://localhost:8000/api/summaries/today")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Endpoint successful: Found {len(data)} summaries for today")
        
        if data:
            print("\n📊 Summary Statistics:")
            topics = {}
            for summary in data:
                topic = summary.get('topic', 'unknown')
                topics[topic] = topics.get(topic, 0) + 1
            
            for topic, count in sorted(topics.items()):
                print(f"   - {topic}: {count} summaries")
            
            print("\n📅 Date Range Verification:")
            dates = [s['date'] for s in data if s.get('date')]
            if dates:
                earliest = min(dates)
                latest = max(dates)
                print(f"   - Earliest: {earliest}")
                print(f"   - Latest: {latest}")
                
                # Check if all dates are from today (Central Time)
                central_tz = pytz.timezone('US/Central')
                now_central = datetime.now(central_tz)
                today_str = now_central.strftime('%Y-%m-%d')
                
                all_today = all(date.startswith(today_str) for date in dates if date)
                print(f"   - All from today ({today_str}): {'✅ Yes' if all_today else '❌ No'}")
            
            print("\n🔍 Sample Summary:")
            sample = data[0]
            print(f"   Title: {sample.get('title', 'N/A')}")
            print(f"   Topic: {sample.get('topic', 'N/A')}")
            print(f"   Date: {sample.get('date', 'N/A')}")
            print(f"   Sources: {len(sample.get('sources', []))} source(s)")
            print(f"   Summary: {sample.get('summary', 'N/A')[:100]}...")
        else:
            print("   No summaries found for today")
    else:
        print(f"❌ Endpoint failed: HTTP {response.status_code}")
        print(f"   Response: {response.text}")
        
except Exception as e:
    print(f"❌ Connection error: {e}")

print("\n=== TEST COMPLETE ===")
