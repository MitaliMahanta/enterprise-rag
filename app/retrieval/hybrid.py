from collections import defaultdict
from app.models import DocumentChunk


class HybridRetriever:

    def __init__(
        self,
        dense_retriever,
        bm25_retriever
    ):

        self.dense = dense_retriever
        self.bm25 = bm25_retriever

    def search(
        self,
        query,
        top_k=5,
        rrf_k=60
    ):

        dense_results = self.dense.search(
            query,
            top_k
        )

        bm25_results = self.bm25.search(
            query,
            top_k
        )

        scores = defaultdict(float)

        documents = {}

        for rank, result in enumerate(
            dense_results,
            start=1
        ):
            payload = result.payload or {}
            doc_id = payload["chunk_id"]

            scores[doc_id] += (
                1 / (rrf_k + rank)
            )

            documents[doc_id] = DocumentChunk(
                chunk_id=doc_id,
                text=payload.get("text", ""),
                source=payload.get("source", "unknown"),
            )


        for rank, result in enumerate(
            bm25_results,
            start=1
        ):
            doc_id = result.chunk_id

            scores[doc_id] += (
                1 / (rrf_k + rank)
            )

            documents[doc_id] = result


        ranked_ids = sorted(
            scores,
            key=scores.get,
            reverse=True
        )

        return [
            documents[doc_id]
            for doc_id in ranked_ids[:top_k]
        ]