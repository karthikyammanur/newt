from app.utils.prefetch_job import fetch_latest_tech_articles, generate_summary_and_topic

# Test fetching articles
print("Testing article fetching...")
articles = fetch_latest_tech_articles(max_articles=2)
print(f"Found {len(articles)} articles")

# Test generating summary for one article if available
if articles:
    print("\nTesting summary generation...")
    sample_article = articles[0]
    print(f"Processing: {sample_article['title']}")
    
    result = generate_summary_and_topic(sample_article)
    print(f"Generated title: {result['title']}")
    print(f"Generated topic: {result['topic']}")
    print(f"Generated summary: {result['summary'][:100]}...")
else:
    print("No articles to test with")
