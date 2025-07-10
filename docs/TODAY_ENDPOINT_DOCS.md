# /summaries/today Endpoint Documentation

## Overview

The `/summaries/today` endpoint returns all news summaries generated for the current day in Central Time.

## Endpoint Details

- **URL**: `/api/summaries/today`
- **Method**: `GET`
- **Authentication**: Not required (public endpoint)

## Response Format

Returns an array of summary objects, sorted by timestamp (latest first):

```json
[
  {
    "title": "AI-Generated Article Title",
    "summary": "Concise 1-2 paragraph summary of the article...",
    "topic": "ai",
    "date": "2025-07-09T22:48:48.953000",
    "sources": ["https://source-url.com"]
  }
]
```

## Key Features

### 🕐 **Timezone-Aware Filtering**

- Uses Central Time (US/Central) to determine "today"
- Automatically converts to UTC for MongoDB queries
- Ensures accurate date boundaries regardless of server timezone

### 📅 **Date Range Logic**

- **Start**: Today 00:00:00 Central Time
- **End**: Today 23:59:59 Central Time
- Only includes summaries with `date` field within this range

### 🔄 **Sorting**

- Results sorted by `date` field in descending order
- Latest summaries appear first
- Consistent ordering for reliable pagination

### 📊 **Complete Data**

Each summary includes all required fields:

- `title`: AI-generated or original article title
- `summary`: Concise summary text
- `topic`: Auto-categorized topic (ai, cybersecurity, etc.)
- `date`: ISO 8601 timestamp
- `sources`: Array of source URLs

## Example Usage

### cURL

```bash
curl -X GET "http://localhost:8000/api/summaries/today"
```

### JavaScript/Fetch

```javascript
const response = await fetch("/api/summaries/today");
const todaysSummaries = await response.json();
console.log(`Found ${todaysSummaries.length} summaries for today`);
```

### Python/Requests

```python
import requests
response = requests.get("http://localhost:8000/api/summaries/today")
summaries = response.json()
```

## Use Cases

1. **Daily Dashboard**: Show today's news summaries
2. **Fresh Content**: Display latest generated content
3. **Daily Archive**: Access today's complete summary collection
4. **Topic Analysis**: Analyze today's news distribution by topic

## Comparison with Other Endpoints

| Endpoint           | Purpose     | Filtering      | Limit    |
| ------------------ | ----------- | -------------- | -------- |
| `/summaries`       | Public feed | None/Topic     | 3 unique |
| `/past_summaries`  | Historical  | Topic optional | No limit |
| `/summaries/today` | Today only  | Date (today)   | No limit |

## Integration Notes

- Compatible with existing frontend NewsCard component
- Returns same data structure as other summary endpoints
- Can be used for daily statistics and analytics
- Supports real-time updates as new summaries are generated
