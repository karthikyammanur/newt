from app.utils.prefetch_job import fetch_latest_tech_articles, generate_summary_and_topic

print("Testing topic generation...")
articles = fetch_latest_tech_articles(max_articles=1)
print(f"Fetched {len(articles)} articles")

if articles:
    print(f"Testing with article: {articles[0]['title']}")
    result = generate_summary_and_topic(articles[0])
    print(f"Generated topic: {result['topic']}")
    print(f"Generated title: {result['title']}")
    print(f"Summary length: {len(result['summary'])} characters")
else:
    print("No articles to test with")
