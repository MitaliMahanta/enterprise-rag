from app.retrieval.dense import DenseRetriever
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.hybrid import HybridRetriever
from app.retrieval.reranker import CrossEncoderReranker
from app.models import RetrievedChunk
from app.services.document_service import DocumentService
import time

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

        self.last_timings = {}

    def run(self, query: str, candidate_k: int = 20, rerank_k: int = 5) -> tuple[list[RetrievedChunk], list[RetrievedChunk]]:
        retrieval_start = time.perf_counter()

        candidates = self.hybrid.retrieve(query, top_k=candidate_k)
        dense_latency_ms = self.hybrid.last_timings.get("dense_ms", 0.0)
        bm25_latency_ms = self.hybrid.last_timings.get("bm25_ms", 0.0)
        rrf_latency_ms = self.hybrid.last_timings.get("rrf_ms", 0.0)
        retrieval_pipeline_latency_ms = (time.perf_counter() - retrieval_start) * 1000

        if not candidates:
            self.last_timings = {
                "dense_ms": dense_latency_ms,
                "bm25_ms": bm25_latency_ms,
                "rrf_ms": rrf_latency_ms,
                "retrieval_pipeline_ms": retrieval_pipeline_latency_ms,
                "reranker_ms": 0.0,
            }
            return [], []

        reranker_start = time.perf_counter()
        reranked = self.reranker.rerank(query, candidates, top_k=rerank_k)
        reranker_latency_ms = (time.perf_counter() - reranker_start) * 1000

        self.last_timings = {
            "dense_ms": dense_latency_ms,
            "bm25_ms": bm25_latency_ms,
            "rrf_ms": rrf_latency_ms,
            "retrieval_pipeline_ms": retrieval_pipeline_latency_ms,
            "reranker_ms": reranker_latency_ms,
        }

        return candidates, reranked