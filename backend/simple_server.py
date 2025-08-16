from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
import uvicorn
import os
import json
from datetime import datetime, timedelta
import bcrypt
import logging
from pydantic import BaseModel

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("simple_server")

# Initialize FastAPI app
app = FastAPI(title="AI News Summarizer - Mock Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT configuration
SECRET_KEY = "mock_secret_key_for_development_only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Mock database
class MockDB:
    def __init__(self):
        self.users = {
            "testuser": {
                "email": "testuser@example.com",
                "hashed_password": self._hash_password("testpass"),
                "user_id": "user123",
                "points": 42,
                "total_summaries_read": 15,
                "today_reads": 3,
                "followers": [],
                "following": []
            }
        }
        self.summaries = self._load_mock_summaries()
    
    def _hash_password(self, password):
        # Properly hash password with bcrypt
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password, hashed_password):
        # Properly verify password with bcrypt
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    
    def get_user(self, username):
        return self.users.get(username)
    
    def create_user(self, username, password, email):
        if username in self.users:
            return False
        
        self.users[username] = {
            "email": email,
            "hashed_password": self._hash_password(password),
            "user_id": f"user_{len(self.users) + 1}",
            "points": 0,
            "total_summaries_read": 0,
            "today_reads": 0,
            "followers": [],
            "following": []
        }
        return True
    
    def _load_mock_summaries(self):
        return [
            {
                "_id": "summary1",
                "title": "AI Advances in Natural Language Processing",
                "summary": "Recent advances in NLP have pushed the boundaries of what's possible with language models. New techniques for fine-tuning and efficient training have resulted in models that can understand context better and generate more coherent responses.",
                "topic": "AI",
                "date": datetime.now().isoformat(),
                "sources": ["techcrunch.com", "ai-journal.com"],
                "urlToImage": "https://images.unsplash.com/photo-1677442135073-0c45cd972ca1?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary2",
                "title": "The Rise of Edge Computing",
                "summary": "Edge computing continues to gain traction as organizations seek to process data closer to the source. This approach reduces latency, conserves bandwidth, and enhances privacy by keeping sensitive data local rather than sending it to the cloud.",
                "topic": "Cloud",
                "date": datetime.now().isoformat(),
                "sources": ["wired.com", "techradar.com"],
                "urlToImage": "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1032&auto=format&fit=crop"
            },
            {
                "_id": "summary3",
                "title": "Quantum Computing Breakthrough",
                "summary": "Scientists have achieved a significant milestone in quantum computing by demonstrating quantum error correction at scale. This breakthrough brings us one step closer to practical quantum computers that could revolutionize fields from cryptography to drug discovery.",
                "topic": "Quantum",
                "date": datetime.now().isoformat(),
                "sources": ["nature.com", "science.org"],
                "urlToImage": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1032&auto=format&fit=crop"
            }
        ]

# Initialize mock database
db = MockDB()

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Create token function
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    # In a real app, we'd use JWT, but for mock we'll just encode/decode with json
    token = json.dumps(to_encode)
    return token

def decode_token(token: str):
    try:
        payload = json.loads(token)
        username = payload.get("sub")
        if username is None:
            return None
        return username
    except:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    username = decode_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.get_user(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Mock backend is running"}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    
    user = db.get_user(form_data.username)
    if not user:
        logger.warning(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not db.verify_password(form_data.password, user["hashed_password"]):
        logger.warning(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=access_token_expires
    )
    
    logger.info(f"Login successful for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register")
async def register(username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    logger.info(f"Registration attempt for user: {username}")
    
    if db.get_user(username):
        logger.warning(f"User already exists: {username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    success = db.create_user(username, password, email)
    if not success:
        logger.error(f"Failed to create user: {username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username},
        expires_delta=access_token_expires
    )
    
    logger.info(f"Registration successful for user: {username}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    logger.info(f"Getting user info for: {current_user['email']}")
    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "points": current_user["points"],
        "total_summaries_read": current_user["total_summaries_read"],
        "today_reads": current_user["today_reads"]
    }

@app.get("/api/summaries/today")
async def get_todays_summaries():
    logger.info("Getting today's summaries")
    return db.summaries

@app.post("/api/summaries/generate")
async def generate_summaries(current_user: dict = Depends(get_current_user)):
    """Mock endpoint to simulate generating new summaries"""
    logger.info(f"Manually generating summaries requested by: {current_user['email']}")
    
    # For the simple server, we'll just add a new mock summary
    new_summary = {
        "_id": f"summary{len(db.summaries) + 1}",
        "title": "Latest Developments in Blockchain Technology",
        "summary": "New blockchain protocols are enabling faster transactions and lower energy consumption. These advancements are making blockchain more viable for everyday applications beyond cryptocurrency.",
        "topic": "Blockchain",
        "date": datetime.now().isoformat(),
        "sources": ["coindesk.com", "blockchain-journal.com"],
        "urlToImage": "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1032&auto=format&fit=crop"
    }
    
    db.summaries.append(new_summary)
    
    return {
        "success": True,
        "message": f"Successfully generated a new summary (total: {len(db.summaries)})",
        "count": len(db.summaries)
    }

@app.get("/api/summaries/{summary_id}")
async def get_summary(summary_id: str):
    logger.info(f"Getting summary: {summary_id}")
    for summary in db.summaries:
        if summary["_id"] == summary_id:
            return summary
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Summary not found"
    )

@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    logger.info("Getting user list")
    
    # Create mock user list for discovery
    user_list = []
    for username, user in db.users.items():
        if user["user_id"] != current_user["user_id"]:  # Don't include current user
            user_list.append({
                "user_id": user["user_id"],
                "email": user["email"],
                "points": user["points"],
                "total_summaries_read": user["total_summaries_read"],
                "follower_count": len(user.get("followers", [])),
                "following_count": len(user.get("following", [])),
                "created_at": datetime.now().isoformat()
            })
    
    return {"users": user_list}

# Main function to run the server
if __name__ == "__main__":
    logger.info("Starting AI News Summarizer mock backend server")
    uvicorn.run(app, host="0.0.0.0", port=8000)
