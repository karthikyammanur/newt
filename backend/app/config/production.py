import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_HOST = "0.0.0.0"  # Listen on all network interfaces
API_PORT = int(os.getenv("PORT", 8000))  # Use the PORT environment variable (provided by many hosting services)
API_CORS_ORIGINS = [
    os.getenv("FRONTEND_URL", "https://your-frontend-vercel-url.vercel.app"),
    "https://*.vercel.app"  # Allow all Vercel preview deployments
]

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://username:password@cluster.mongodb.net/newt?retryWrites=true&w=majority")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "newt")

# Google Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Other configurations
DEBUG = False
TESTING = False
