# app/vector_store.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams


class VectorStore:

    def __init__(self, host="localhost", port=6333):
        self.client = QdrantClient(host=host, port=port)
        self.collection = "enterprise_rag"
        self._ensure_collection()

    def _ensure_collection(self):
        """Creates collection if it does not exist."""
        collections = [c.name for c in self.client.get_collections().collections]
        if self.collection not in collections:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )

    def create_collection(self):
        """Force deletes existing collection and starts completely fresh."""
        collections = self.client.get_collections().collections
        names = [c.name for c in collections]

        # Force delete old collection to purge "unknown" or stale records
        if self.collection in names:
            self.client.delete_collection(collection_name=self.collection)

        self.client.create_collection(
            collection_name=self.collection,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE,
            ),
        )

    def add_chunk(self, embedding, text: str, source: str, chunk_id: int):
        # Convert numpy array to list if necessary
        vector = (
            embedding.tolist() if hasattr(embedding, "tolist") else embedding
        )

        self.client.upsert(
            collection_name=self.collection,
            points=[
                PointStruct(
                    id=chunk_id,
                    vector=vector,
                    payload={
                        "text": text,
                        "source": source,
                        "chunk_id": chunk_id,
                    },
                )
            ],
        )

    def search(self, query_vector, limit: int = 5):
        vector = (
            query_vector.tolist()
            if hasattr(query_vector, "tolist")
            else query_vector
        )

        # Handle qdrant-client versions (search vs query_points)
        if hasattr(self.client, "search"):
            return self.client.search(
                collection_name=self.collection,
                query_vector=vector,
                limit=limit,
            )
        else:
            response = self.client.query_points(
                collection_name=self.collection, query=vector, limit=limit
            )
            return response.points