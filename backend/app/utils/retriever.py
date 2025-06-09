try:
    from .vectorstore import add_articles, search_articles
except ImportError:
    from vectorstore import add_articles, search_articles

def ingest_articles(articles: list[dict]):
    """
    Ingest a batch of articles into the vector store.
    articles: list of {"id": str, "title": str, "content": str}
    """
    add_articles(articles)

def retrieve_relevant_articles(topic: str, top_k: int = 3) -> list[dict]:
    """
    Given a topic or query, return the top_k most relevant articles.
    """
    return search_articles(topic, top_k)
