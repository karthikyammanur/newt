print("🚀 FastAPI app is starting up!")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Load environment variables
from dotenv import load_dotenv
load_dotenv()
print(f"🔑 Environment loaded. GEMINI_API_KEY present: {'GEMINI_API_KEY' in os.environ}")

# Add this to make sure imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import routes with try/except for better error handling
try:
    from app.api import routes
    print("✅ Routes imported successfully")
except Exception as e:
    print(f"❌ Error importing routes: {e}")
    import traceback
    traceback.print_exc()
    raise

app = FastAPI(title="NEWT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

@app.on_event("startup")
async def startup_event():
    try:
        from app.db.database import Base, engine
        Base.metadata.create_all(bind=engine)
        print("✅ SQLite database initialized")
    except Exception as e:
        print(f"❌ Warning - SQLite database error: {e}")
        print("Continuing without SQLite initialization...")

try:
    app.include_router(routes.router, prefix="/api")
    print(f"✅ API routes mounted with prefix '/api'")
    # Print available routes for debugging
    print(f"📊 Available routes: {[route.path for route in app.routes]}")
except Exception as e:
    print(f"❌ Error mounting API routes: {e}")
    raise

# Add this to run the server directly
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting server directly...")
    uvicorn.run(app, host="127.0.0.1", port=8000)