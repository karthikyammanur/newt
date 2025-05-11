import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_articles(articles):
    prompt = (
        "You're a neutral, fact-based news summarizer.\n"
        "Summarize the following articles about the same topic.\n"
        "Give a balanced summary representing all sides fairly.\n\n"
    )

    for i, article in enumerate(articles):
        prompt += f"Article {i+1}:\nTitle: {article['title']}\nContent: {article['content']}\n\n"

    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    return response.text.strip()
