import sys
from pathlib import Path

# Add root directory to sys.path to resolve 'app' imports cleanly
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.embeddings import EmbeddingEngine
from app.vector_store import VectorStore

def search(query: str, top_k: int = 5):
    # 1. Convert user's question to an embedding
    engine = EmbeddingEngine()
    query_vector = engine.embed(query)

    # 2. Query Qdrant for nearest vectors using your VectorStore search method
    store = VectorStore()
    results = store.search(query_vector, limit=top_k)

    # 3. Print top results with citations
    print(f"\nQuestion:\n{query}\n")
    for idx, hit in enumerate(results, 1):
        payload = hit.payload or {}
        text = payload.get("text", "")
        source = payload.get("source", "unknown")
        chunk_id = payload.get("chunk_id", "unknown")
        
        print(f"Result {idx} [{source}, chunk {chunk_id}]")
        print(f"{text}\n")

if __name__ == "__main__":
    user_query = input("Enter your question: ")
    search(user_query)