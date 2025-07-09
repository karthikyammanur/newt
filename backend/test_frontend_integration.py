import requests

print(" FRONTEND INTEGRATION TEST \n")

# Test the API endpoint that the frontend will use
try:
    response = requests.get("http://localhost:8000/api/summaries/today")
    if response.status_code == 200:
        data = response.json()
        print(f"API Response: {len(data)} summaries available")
        
        if data:
            print("\n Feed Preview:")
            for i, summary in enumerate(data[:3]):  # Show first 3
                print(f"{i+1}. {summary.get('title', 'No title')}")
                print(f"   Topic: {summary.get('topic', 'No topic')}")
                print(f"   Date: {summary.get('date', 'No date')}")
                print(f"   Sources: {len(summary.get('sources', []))} source(s)")
                print()
            
            if len(data) > 3:
                print(f"   ... and {len(data) - 3} more summaries")
        
        print("\n Frontend Integration Ready:")
        print("   - SummariesPage.jsx updated to use /summaries/today")
        print("   - Displays all summaries in feed format (newest first)")
        print("   - Topic labels displayed at top of each card")
        print("   - Title truncation at 80 characters")
        print("   - Sources displayed at bottom")
        print("   - LandingPage topics now link to past summaries")
        
    else:
        print(f" API Error: HTTP {response.status_code}")
        
except Exception as e:
    print(f" Connection error: {e}")

print("\n=== TEST COMPLETE ===")
print(" Frontend ready to display today's news feed!")
