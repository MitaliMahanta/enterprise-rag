from app.models import DocumentChunk


class DenseRetriever:

    def __init__(
        self,
        embedding_engine,
        vector_store
    ):

        self.embedding_engine = embedding_engine
        self.vector_store = vector_store

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