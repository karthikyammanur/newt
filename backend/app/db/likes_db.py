import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "likes.sqlite3")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        conn.commit()

#add a liked topic
def like_topic(topic: str):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO likes (topic) VALUES (?);", (topic,))
        conn.commit()

#get all liked topics
def get_liked_topics():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT topic FROM likes;")
        return [row[0] for row in cursor.fetchall()]
