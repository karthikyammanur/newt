print("🚀 FastAPI app is starting up!")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes

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
    from app.db.database import Base, engine
    Base.metadata.create_all(bind=engine)

app.include_router(routes.router, prefix="/api")