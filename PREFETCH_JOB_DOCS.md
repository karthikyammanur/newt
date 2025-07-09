# Daily News Prefetch Job Documentation

## Overview

The `prefetch_job.py` script has been updated to automatically fetch, summarize, and categorize the latest tech news articles daily.

## Key Features

### 🕛 **Daily Execution**

- Designed to run daily at midnight Central Time
- Automatically handles timezone conversions
- Only processes articles from the last 24 hours

### 📰 **Article Fetching**

- Fetches all available tech articles from GNews API
- Filters for technology-related content using keyword matching
- No manual topic filtering - gets comprehensive tech coverage

### 🤖 **AI-Powered Processing**

- **Summary Generation**: Uses Gemini AI to create concise 1-2 paragraph summaries
- **Topic Classification**: Automatically categorizes articles into topics like:
  - AI, Machine Learning, Cybersecurity, Cloud Computing
  - Software Engineering, Data Science, Hardware, Startups
  - Web Development, Programming Languages, Semiconductors
  - Blockchain, IoT, DevOps, or Other

### 📊 **Data Storage**

- Stores in MongoDB with clean schema:
  ```json
  {
    "title": "AI-generated title",
    "summary": "Concise summary text",
    "topic": "auto-categorized topic",
    "date": "2025-07-09T17:48:23.657Z",
    "sources": ["https://source-url.com"]
  }
  ```

### 🔄 **Duplicate Prevention**

- Clears existing summaries from current day before processing
- Ensures fresh content without duplicates
- Maintains historical data from previous days

## Usage

### Manual Execution

```bash
cd backend
python -m app.utils.prefetch_job
```

### Scheduled Execution

Use the provided `scheduler.py` for automated daily runs:

```bash
cd backend
python scheduler.py
```

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 12:00 AM Central Time
4. Set action: Start a program
5. Program: `python`
6. Arguments: `c:\path\to\backend\app\utils\prefetch_job.py`

## Configuration

### Environment Variables Required

- `GNEWS_API_KEY`: GNews API key for article fetching
- `GEMINI_API_KEY`: Google Gemini API key for AI processing
- `MONGODB_URI`: MongoDB connection string

### Customizable Parameters

- `max_articles`: Number of articles to fetch (default: 100)
- Timezone: Currently set to US/Central
- Topic categories: Defined in the `generate_summary_and_topic()` function

## Monitoring

The script provides detailed logging:

- Articles fetched count
- Processing progress for each article
- Success/error messages
- Final completion summary

## Integration

The processed summaries are automatically available through:

- `/api/summaries` endpoint (returns 3 most recent unique summaries)
- `/api/past_summaries` endpoint (returns all summaries with optional topic filtering)
- Frontend displays the latest summaries with proper titles and topics

## Benefits

1. **Automated Content**: No manual intervention needed
2. **Fresh Daily Content**: Always shows latest tech news
3. **Smart Categorization**: AI determines relevant topics automatically
4. **Clean Data**: Proper deduplication and formatting
5. **Timezone Aware**: Correctly handles Central Time scheduling
