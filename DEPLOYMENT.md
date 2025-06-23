# NewT - AI Tech News Summarizer

## Deployment Guide

### Overview

This application consists of:

- **Frontend**: React application (deployed on Vercel)
- **Backend**: Python FastAPI application (needs separate hosting)
- **Database**: MongoDB (use MongoDB Atlas)
- **Scheduled Jobs**: Daily news summarization at midnight

### Step 1: Deploy the Backend

Choose one of these platforms:

- [Railway.app](https://railway.app)
- [Render](https://render.com)
- [Fly.io](https://fly.io)

#### Prerequisites:

1. Create a MongoDB Atlas cluster
2. Get a Google Gemini API key

#### Environment Variables for Backend:

- `MONGODB_URI`: Your MongoDB connection string
- `MONGODB_DB_NAME`: Database name (default: newt)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FRONTEND_URL`: The URL of your Vercel frontend deployment

#### Using Railway.app:

1. Connect your GitHub repository
2. Add the environment variables
3. Set the following:
   - Root Directory: `backend/`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Set Up the Daily Job:

1. Create a new service in the same project
2. Root Directory: `backend/`
3. Start Command: `python -m app.utils.prefetch_job`
4. Add a cron job scheduler (in Railway.app settings) to run daily at midnight: `0 0 * * *`

### Step 2: Deploy the Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Set the build settings:
   - Framework: Create React App
   - Root Directory: `frontend/`
3. Add environment variables:
   - `REACT_APP_API_URL`: URL of your deployed backend API

### Step 3: Test the Deployment

1. Visit your Vercel frontend URL
2. Check that summaries are being fetched from the backend
3. Verify that the daily job is running (check logs in your backend service)

## Troubleshooting

- **CORS Issues**: Make sure your backend CORS settings include the Vercel domain
- **API Connection**: Double-check the REACT_APP_API_URL is correct
- **MongoDB Connection**: Ensure your IP is whitelisted in MongoDB Atlas
- **Cron Job**: Check backend logs to confirm the daily job is running
