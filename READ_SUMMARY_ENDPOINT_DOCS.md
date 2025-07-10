# READ_SUMMARY Endpoint Documentation

## Overview

The `/read_summary` endpoint allows authenticated users to mark summaries as read, earning points and tracking their reading progress.

## Endpoint Details

- **URL**: `POST /api/read_summary`
- **Authentication**: Required (JWT Bearer Token)
- **Content-Type**: `application/json`

## Request Body

```json
{
  "summary_id": "string" // MongoDB ObjectId of the summary
}
```

## Response Format

```json
{
  "message": "Summary processed successfully",
  "points_earned": 1, // Points awarded (0 if already read)
  "total_points": 5, // User's total points after this read
  "today_reads": 3, // Number of summaries read today
  "total_summaries_read": 12, // Total summaries read by user
  "already_read": false // Whether this summary was previously read
}
```

## Business Logic

### Points System

- **1 point** awarded per unique summary read
- **0 points** if summary was already read by the user
- Points are only awarded once per summary per user

### Reading Tracking

- Summary ID added to user's `summaries_read` array (if not already present)
- Daily reading count incremented in `daily_read_log` for current date (Central Time)
- User's `updated_at` timestamp updated

### Duplicate Prevention

- Checks if summary is already in user's `summaries_read` list
- Returns `already_read: true` and `points_earned: 0` for duplicates
- No database modifications for duplicate reads

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Invalid summary ID format"
}
```

### 401 Unauthorized

```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found

```json
{
  "detail": "Summary not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to update read log"
}
```

## Example Usage

### First Time Reading

```bash
curl -X POST http://localhost:8000/api/read_summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"summary_id": "686ef1d01545681d604b8ae4"}'
```

Response:

```json
{
  "message": "Summary processed successfully",
  "points_earned": 1,
  "total_points": 5,
  "today_reads": 3,
  "total_summaries_read": 12,
  "already_read": false
}
```

### Already Read Summary

Same request as above, but for a summary the user has already read:

Response:

```json
{
  "message": "Summary processed successfully",
  "points_earned": 0,
  "total_points": 5,
  "today_reads": 3,
  "total_summaries_read": 12,
  "already_read": true
}
```

## Database Changes

### User Document Updates

When a new summary is read, the following updates occur:

1. **summaries_read**: Summary ID added to array (using `$addToSet`)
2. **points**: Incremented by 1
3. **daily_read_log**: Today's count incremented
4. **updated_at**: Set to current UTC timestamp

Example updated user document:

```json
{
  "user_id": "686eff0514438239a7992853",
  "email": "user@example.com",
  "points": 5,
  "summaries_read": [
    "686ef1d01545681d604b8ae4",
    "686ef1cc1545681d604b8ae3",
    "686ef1c91545681d604b8ae2"
  ],
  "daily_read_log": {
    "2025-07-09": 3,
    "2025-07-08": 2
  },
  "updated_at": "2025-07-09T23:45:00.000Z"
}
```

## Frontend Integration

### AuthContext Usage

```javascript
const { markSummaryRead } = useAuth();

const handleRead = async (summaryId) => {
  const result = await markSummaryRead(summaryId);

  if (result.success) {
    if (result.pointsEarned > 0) {
      showSuccessMessage(`+${result.pointsEarned} point earned!`);
    } else {
      showInfoMessage("Already read");
    }
  } else {
    showErrorMessage(result.error);
  }
};
```

### NewsCard Component

The NewsCard component automatically:

- Shows "Mark as Read" button for authenticated users
- Displays point earned notification
- Prevents duplicate reads with visual feedback
- Updates user stats in real-time

## Key Features

1. **Atomic Operations**: Uses MongoDB `$addToSet` and `$inc` for consistency
2. **Timezone Awareness**: Daily logs use Central Time zone
3. **Duplicate Prevention**: Robust checking prevents double-counting
4. **Real-time Updates**: Frontend immediately reflects changes
5. **Comprehensive Response**: Returns all relevant user statistics

## Testing

Successfully tested with:

- ✅ First-time read (1 point awarded)
- ✅ Duplicate read (0 points, already_read=true)
- ✅ Multiple different summaries (correct point accumulation)
- ✅ User stats updating correctly
- ✅ Error handling for invalid summary IDs
- ✅ Authentication validation
