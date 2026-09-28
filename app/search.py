from app.embeddings import EmbeddingEngine
from app.vector_store import VectorStore

def search(query: str, top_k: int = 5):
    # 1. Convert user's question to an embedding
    engine = EmbeddingEngine()
    query_vector = engine.embed(query)

    # 2. Query Qdrant for the nearest vectors
    store = VectorStore()
    
    results = store.client.query_points(
        collection_name=store.collection,
        query=query_vector,
        limit=top_k
    )

    # 3. Print the top results
    print(f"\nQuestion:\n{query}\n")
    for idx, hit in enumerate(results.points, 1):
        text = hit.payload.get("text", "")
        print(f"Result {idx}")
        print(f"{text}\n")

if __name__ == "__main__":
    # Prompt the user for a question in the terminal
    user_query = input("Enter your question: ")
    search(user_query)