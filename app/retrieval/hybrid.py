from collections import defaultdict
from app.models import RetrievedChunk  # Using RetrievedChunk to match CrossEncoderReranker
import time

class HybridRetriever:

    def __init__(self, dense_retriever, bm25_retriever):
        self.dense = dense_retriever
        self.bm25 = bm25_retriever

    def retrieve(self, query: str, top_k: int = 20, rrf_k: int = 60) -> list[RetrievedChunk]:

        # -----------------------------
        # Dense retrieval
        # -----------------------------
        dense_start = time.perf_counter()


        """Runs Dense + BM25 search, combines ranks using Reciprocal Rank Fusion (RRF),

        and returns top_k RetrievedChunk objects for reranking.
        """
        # Step 1: Run Dense & BM25 retrieval for top_k candidates
        dense_results = self.dense.search(query, top_k=top_k)

        dense_latency_ms = (
        time.perf_counter() - dense_start
        ) * 1000

        # -----------------------------
        # BM25 retrieval
        # -----------------------------
        bm25_start = time.perf_counter()

        bm25_results = self.bm25.search(query, top_k=top_k)

        bm25_latency_ms = (
        time.perf_counter() - bm25_start
        ) * 1000

        # -----------------------------
        # RRF fusion
        # -----------------------------
        rrf_start = time.perf_counter()
        
        scores = defaultdict(float)
        documents = {}

        # Step 2: Accumulate RRF scores from Dense Search
        for rank, result in enumerate(dense_results, start=1):
            payload = getattr(result, "payload", {}) or {}
            doc_id = payload.get("chunk_id", rank)

            scores[doc_id] += 1 / (rrf_k + rank)

            documents[doc_id] = RetrievedChunk(
                chunk_id=doc_id,
                text=payload.get("text", ""),
                source=payload.get("source", "unknown"),
                score=scores[doc_id],
                retrieval_method="dense",
            )

        # Step 3: Accumulate RRF scores from BM25 Search
        for rank, result in enumerate(bm25_results, start=1):
            doc_id = getattr(result, "chunk_id", rank)

            scores[doc_id] += 1 / (rrf_k + rank)

            # Preserve object if present, otherwise build RetrievedChunk
            if isinstance(result, RetrievedChunk):
                documents[doc_id] = result
            else:
                documents[doc_id] = RetrievedChunk(
                    chunk_id=doc_id,
                    text=getattr(result, "text", ""),
                    source=getattr(result, "source", "unknown"),
                    score=scores[doc_id],
                    retrieval_method="bm25",
                )

        # Step 4: Sort candidate chunks by combined RRF score
        ranked_ids = sorted(scores, key=scores.get, reverse=True)

        # Step 5: Update final combined RRF score on returned objects
        retrieved_chunks = []
        for doc_id in ranked_ids[:top_k]:
            chunk = documents[doc_id]
            chunk.score = scores[doc_id]
            chunk.retrieval_method = "hybrid_rrf"
            retrieved_chunks.append(chunk)

        rrf_latency_ms = (
        time.perf_counter() - rrf_start
        ) * 1000

        # Store timing information for the pipeline.
        self.last_timings = {
        "dense_ms": dense_latency_ms,
        "bm25_ms": bm25_latency_ms,
        "rrf_ms": rrf_latency_ms,
        }

        return retrieved_chunks
