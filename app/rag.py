from app.retrieval.pipeline import RetrievalPipeline
from app.llm import LLM
from app.prompt import build_rag_prompt
from app.models import ChatResponse, SourceResponse
import time

class RAGPipeline:
    def __init__(self):
        self.retrieval_pipeline = RetrievalPipeline()
        self.llm = LLM()

    def answer(self, question: str) -> ChatResponse:
        candidates, top_chunks = self.retrieval_pipeline.run(question, candidate_k=20, rerank_k=5)
        
        if not top_chunks:
            return ChatResponse(
                question=question,
                retrieval_method="Dense + BM25",
                hybrid_candidates=0,
                reranked_count=0,
                sources=[],
                answer="I could not find any relevant information in the documents."
            )

        sources = [
            SourceResponse(
                chunk_id=chunk.chunk_id,
                source=chunk.source,
                score=chunk.score,
                retrieval_method=chunk.retrieval_method
            )
            for chunk in top_chunks
        ]

        context_blocks = [
            f"[{chunk.source}, chunk {chunk.chunk_id}]\n{chunk.text.strip()}"
            for chunk in top_chunks
        ]
        context_str = "\n\n".join(context_blocks)
        prompt = build_rag_prompt(question, context_str)
        answer_text = self.llm.generate(prompt)

        return ChatResponse(
            question=question,
            retrieval_method="Dense + BM25",
            hybrid_candidates=len(candidates),
            reranked_count=len(top_chunks),
            sources=sources,
            answer=answer_text
        )
    