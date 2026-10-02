from sentence_transformers import CrossEncoder

from app.models import RetrievedChunk


class CrossEncoderReranker:
    def __init__(
        self,
        model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
    ):
        self.model = CrossEncoder(model_name)

    def rerank(self, query: str, documents: list[RetrievedChunk], top_k: int = 5,) -> list[RetrievedChunk]:

        if not documents:
            return []

        pairs = [
            (query, document.text)
            for document in documents
        ]

        scores = self.model.predict(pairs)

        reranked = []

        for document, score in zip(documents, scores):
            reranked.append(
                RetrievedChunk(
                    chunk_id=document.chunk_id,
                    text=document.text,
                    source=document.source,
                    score=float(score),
                    retrieval_method="reranker",
                )
            )

        reranked.sort(
            key=lambda document: document.score,
            reverse=True,
        )

        return reranked[:top_k]