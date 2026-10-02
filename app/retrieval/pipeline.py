from app.retrieval.reranker import CrossEncoderReranker


class RetrievalPipeline:

    def __init__(
        self,
        hybrid_retriever,
        reranker: CrossEncoderReranker,
    ):
        self.hybrid_retriever = hybrid_retriever
        self.reranker = reranker

    def retrieve(
        self,
        query: str,
        retrieval_k: int = 20,
        final_k: int = 5,
    ):

        candidates = self.hybrid_retriever.search(
            query,
            top_k=retrieval_k,
        )

        reranked = self.reranker.rerank(
            query=query,
            documents=candidates,
            top_k=final_k,
        )

        return reranked