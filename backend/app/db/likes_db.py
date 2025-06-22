import sqlite3
import os
import numpy as np
from app.utils.embedder import get_embedding

db_path = os.path.join(os.path.dirname(__file__), "likes.db")

def init_db():
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS likes (
                        user_id TEXT,
                        article_id TEXT,
                        PRIMARY KEY (user_id, article_id)
                    )''')
        conn.commit()

def like_article(user_id: str, article_id: str):
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute("INSERT OR IGNORE INTO likes (user_id, article_id) VALUES (?, ?)", (user_id, article_id))
        conn.commit()

def unlike_article(user_id: str, article_id: str):
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM likes WHERE user_id = ? AND article_id = ?", (user_id, article_id))
        conn.commit()

def get_liked_articles(user_id: str):
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute("SELECT article_id FROM likes WHERE user_id = ?", (user_id,))
        return [row[0] for row in c.fetchall()]