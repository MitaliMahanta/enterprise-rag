from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

class VectorStore:

    def __init__(self):

        self.client = QdrantClient("localhost", port=6333)

        self.collection = "research_docs"

        self.create_collection()

    def create_collection(self):

        collections = self.client.get_collections().collections

        names = [c.name for c in collections]

        if self.collection not in names:

            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=384,
                    distance=Distance.COSINE,
                ),
            )

    def add_chunk(self, vector, text):

        self.client.upsert(
            collection_name=self.collection,
            points=[
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector.tolist(),
                    payload={"text": text},
                )
            ],
        )