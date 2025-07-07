print("🚀 FastAPI app is starting up!")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes

app = FastAPI(title="NEWT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3006",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3006",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
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