import app.retrieval.pipeline as pipeline_module
from app.models import DocumentChunk


class DummyDocumentService:
    @staticmethod
    def load_documents(pdf_dir: str = "data/pdfs"):
        return [
            DocumentChunk(chunk_id=1, text="BERT is a transformer-based language model.", source="bert.pdf"),
            DocumentChunk(chunk_id=2, text="BERT stands for Bidirectional Encoder Representations from Transformers.", source="bert.pdf"),
        ]


class DummyVectorStore:
    def create_collection(self):
        pass


class DummyDenseRetriever:
    def __init__(self):
        self.indexed = []
        self.vector_store = DummyVectorStore()

    def index_documents(self, documents):
        self.indexed.extend(documents)

    def search(self, query, top_k=5):
        return []


class DummyBM25Retriever:
    def __init__(self, documents):
        self.documents = documents


class DummyHybridRetriever:
    def __init__(self, dense_retriever, bm25_retriever):
        self.dense = dense_retriever
        self.bm25 = bm25_retriever

    def retrieve(self, query, top_k=20, rrf_k=60):
        return []


class DummyReranker:
    def rerank(self, query, documents, top_k=5):
        return documents[:top_k]


def test_retrieval_pipeline_does_not_reindex_documents_on_init(monkeypatch):
    monkeypatch.setattr(pipeline_module, "DocumentService", DummyDocumentService)
    monkeypatch.setattr(pipeline_module, "DenseRetriever", DummyDenseRetriever)
    monkeypatch.setattr(pipeline_module, "BM25Retriever", DummyBM25Retriever)
    monkeypatch.setattr(pipeline_module, "HybridRetriever", DummyHybridRetriever)
    monkeypatch.setattr(pipeline_module, "CrossEncoderReranker", DummyReranker)

    pipeline = pipeline_module.RetrievalPipeline()

    assert len(pipeline.dense.indexed) == 0
    assert pipeline.bm25.documents[0].source == "bert.pdf"
