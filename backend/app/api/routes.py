from fastapi import APIRouter, Request
from app.utils.summarizer import summarize_articles

router = APIRouter()

@router.post("/summarize")
async def summarize(request: Request):
    body = await request.json()
    articles = body.get("articles", [])
    if not articles:
        return {"error": "No articles provided."}
    
    summary = summarize_articles(articles)
    return {"summary": summary}