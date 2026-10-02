import time

from app.models import RetrievedChunk
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.dense import DenseRetriever
from app.retrieval.hybrid import HybridRetriever
from app.retrieval.reranker import CrossEncoderReranker
from app.services.document_service import DocumentService


class RetrievalPipeline:
    def __init__(self):
        documents = DocumentService().load_documents()

        self.dense = DenseRetriever()
        self.bm25 = BM25Retriever(documents)

        self.hybrid = HybridRetriever(
            dense_retriever=self.dense,
            bm25_retriever=self.bm25,
        )

        self.reranker = CrossEncoderReranker()

        self.last_timings = {}

    def run(
        self,
        query: str,
        candidate_k: int = 20,
        rerank_k: int = 5,
    ) -> tuple[list[RetrievedChunk], list[RetrievedChunk]]:

        retrieval_start = time.perf_counter()

        candidates = self.hybrid.retrieve(
            query,
            top_k=candidate_k,
        )

        retrieval_pipeline_latency_ms = (
            time.perf_counter() - retrieval_start
        ) * 1000

        if not candidates:
            self.last_timings = {
                **self.hybrid.last_timings,
                "retrieval_pipeline_ms": retrieval_pipeline_latency_ms,
                "reranker_ms": 0.0,
            }

            return [], []

        reranker_start = time.perf_counter()

        reranked = self.reranker.rerank(
            query,
            candidates,
            top_k=rerank_k,
        )

        reranker_latency_ms = (
            time.perf_counter() - reranker_start
        ) * 1000

        self.last_timings = {
            **self.hybrid.last_timings,
            "retrieval_pipeline_ms": retrieval_pipeline_latency_ms,
            "reranker_ms": reranker_latency_ms,
        }

        return candidates, reranked