import os
import chromadb

try:
    from .embedder import get_embedding
except ImportError:
    from embedder import get_embedding

client = chromadb.PersistentClient(path="chromadb")

#get a collection named "articles"
collection = client.get_or_create_collection(
    name="articles",
    metadata={"hnsw:space": "cosine"}
)

def add_articles(articles: list[dict]):
    """
    articles: list of {"id": str, "title": str, "content": str}
    """
    ids       = [a["id"] for a in articles]
    metadatas = [{"title": a["title"]} for a in articles]
    documents = [a["content"] for a in articles]
    embeddings = [
        get_embedding(a["title"] + "\n" + a["content"])
        for a in articles
    ]

    collection.add(
        ids=ids,
        metadatas=metadatas,
        embeddings=embeddings,
        documents=documents
    )

def search_articles(query: str, top_k: int = 3) -> list[dict]:
    """Return top_k articles most similar to the query."""
    q_emb = get_embedding(query)
    results = collection.query(
        query_embeddings=[q_emb],
        n_results=top_k
    )
    # results fields: 'ids', 'documents', 'metadatas'
    docs = []
    for _id, doc, meta in zip(results["ids"][0],
                              results["documents"][0],
                              results["metadatas"][0]):
        docs.append({
            "id": _id,
            "title": meta["title"],
            "content": doc
        })
    return docs
