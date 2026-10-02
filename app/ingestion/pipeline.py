from app.models import DocumentChunk
from app.retrieval.dense import DenseRetriever
from app.services.document_service import DocumentService


class IngestionPipeline:
    def __init__(self):
        self.document_service = DocumentService()
        self.dense_retriever = DenseRetriever()

    def run(self) -> int:
        documents: list[DocumentChunk] = (
            self.document_service.load_documents()
        )

        if not documents:
            return 0

        # Rebuild the vector index from the current documents.
        self.dense_retriever.vector_store.create_collection()

        self.dense_retriever.index_documents(documents)

        return len(documents)