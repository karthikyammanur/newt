import sqlite3
import os
import numpy as np
from app.utils.embedder import get_embedding

db_path = os.path.join(os.path.dirname(__file__), "likes.db")

def init_db():
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS likes (
                        topic TEXT PRIMARY KEY,
                        embedding BLOB
                    )''')
        conn.commit()

def like_topic(topic: str):
    embedding = get_embedding(topic)
    embedding_blob = np.array(embedding, dtype=np.float32).tobytes()
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute("INSERT OR REPLACE INTO likes (topic, embedding) VALUES (?, ?)", (topic, embedding_blob))
        conn.commit()

def get_liked_topics():
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute("SELECT topic FROM likes")
        return [row[0] for row in c.fetchall()]

def get_liked_embeddings():
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute("SELECT topic, embedding FROM likes")
        data = c.fetchall()
        return [(topic, np.frombuffer(blob, dtype=np.float32)) for topic, blob in data]