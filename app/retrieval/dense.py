from app.config import settings
from app.models import DocumentChunk
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams


class EmbeddingEngine:
    def __init__(self):
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed(self, text):
        return self.model.encode(text)


class VectorStore:
    def __init__(self, host=None, port=None, collection=None):
        self.client = QdrantClient(
            host=host or settings.QDRANT_HOST,
            port=port or settings.QDRANT_PORT,
        )
        self.collection = collection or settings.QDRANT_COLLECTION
        self._ensure_collection()

    def _ensure_collection(self):
        collections = [item.name for item in self.client.get_collections().collections]
        if self.collection not in collections:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )

    def create_collection(self):
        collections = self.client.get_collections().collections
        names = [item.name for item in collections]
        if self.collection in names:
            self.client.delete_collection(collection_name=self.collection)

        self.client.create_collection(
            collection_name=self.collection,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

    def add_chunk(self, embedding, text: str, source: str, chunk_id: int):
        vector = embedding.tolist() if hasattr(embedding, "tolist") else embedding
        self.client.upsert(
            collection_name=self.collection,
            points=[
                PointStruct(
                    id=chunk_id,
                    vector=vector,
                    payload={"text": text, "source": source, "chunk_id": chunk_id},
                )
            ],
        )

    def search(self, query_vector, limit: int = 5):
        vector = query_vector.tolist() if hasattr(query_vector, "tolist") else query_vector
        if hasattr(self.client, "search"):
            return self.client.search(
                collection_name=self.collection,
                query_vector=vector,
                limit=limit,
            )
        response = self.client.query_points(
            collection_name=self.collection, query=vector, limit=limit
        )
        return response.points


class DenseRetriever:

    def __init__(
        self,
        embedding_engine=None,
        vector_store=None,
    ):

        self.embedding_engine = embedding_engine or EmbeddingEngine()
        self.vector_store = vector_store or VectorStore()

    def index_documents(self, documents: list[DocumentChunk]):
        for document in documents:
            vector = self.embedding_engine.embed(document.text)
            self.vector_store.add_chunk(
                vector,
                document.text,
                document.source,
                document.chunk_id,
            )

    def search(self, query, top_k=5):

        vector = self.embedding_engine.embed(
            query
        )

        return self.vector_store.search(
            vector,
            limit=top_k
        )