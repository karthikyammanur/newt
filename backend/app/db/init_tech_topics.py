from likes_db import init_db, like_topic
init_db()

TECH_TOPICS = [
    "artificial intelligence",
    "machine learning",
    "software engineering",
    "cloud computing",
    "cybersecurity",
    "quantum computing",
    "blockchain technology",
    "data science",
    "IoT",
    "5G technology"
]

def init_tech_topics():
    print("Initializing Tech Topics")
    
    for topic in TECH_TOPICS:
        try:
            like_topic(topic)
            print(f"Added: {topic}")
        except Exception as e:
            print(f"Failed to add {topic}: {e}")

if __name__ == "__main__":
    init_tech_topics()
