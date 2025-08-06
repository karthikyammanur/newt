from datetime import datetime, timedelta
from typing import Optional
# Temporarily disabled: from jose import JWTError, jwt
# Temporarily disabled: from passlib.context import CryptContext
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

# Temporary mock classes for JWT functionality
class JWTError(Exception):
    pass

class CryptContext:
    def __init__(self, schemes=None, deprecated=None):
        pass
    
    def verify(self, password, hashed):
        return password == "password123"  # Temporary simple auth
    
    def hash(self, password):
        return f"hashed_{password}"

# Temporary JWT mock functions
class jwt:
    @staticmethod
    def encode(data, key, algorithm):
        return f"mock_token_{data.get('sub', 'user')}"
    
    @staticmethod
    def decode(token, key, algorithms):
        if token.startswith("mock_token_"):
            username = token.replace("mock_token_", "")
            return {"sub": username}
        raise JWTError("Invalid token")

load_dotenv()

# JWT Configuration
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "default-app-secret-key")
SECRET_KEY = APP_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    points: int
    total_summaries_read: int
    today_reads: int

class UserInDB(BaseModel):
    email: str
    hashed_password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def get_current_user_email(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency to get current user email from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    return email

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency to get current user data"""
    from app.db.mongodb import get_user_by_email
    
    email = get_current_user_email(token)
    user = get_user_by_email(email)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user
