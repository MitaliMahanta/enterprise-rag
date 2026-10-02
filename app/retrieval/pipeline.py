from app.retrieval.dense import DenseRetriever
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.hybrid import HybridRetriever
from app.retrieval.reranker import CrossEncoderReranker
from app.models import RetrievedChunk
from app.services.document_service import DocumentService


class RetrievalPipeline:
    def __init__(self):
        documents = DocumentService().load_documents()

        self.dense = DenseRetriever()
        if documents:
            self.dense.vector_store.create_collection()
            self.dense.index_documents(documents)

        self.bm25 = BM25Retriever(documents)
        self.hybrid = HybridRetriever(
            dense_retriever=self.dense,
            bm25_retriever=self.bm25,
        )
        self.reranker = CrossEncoderReranker()

    def run(self, query: str, candidate_k: int = 20, rerank_k: int = 5) -> tuple[list[RetrievedChunk], list[RetrievedChunk]]:
        # 1. Fetch Top 20 via Hybrid RRF
        candidates = self.hybrid.retrieve(query, top_k=candidate_k)
        if not candidates:
            return [], []

        # 2. Rerank down to Top 5 via Cross-Encoder
        reranked = self.reranker.rerank(query, candidates, top_k=rerank_k)
        return candidates, reranked