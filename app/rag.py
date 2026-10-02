from app.retrieval.pipeline import RetrievalPipeline
from app.llm import LLM
from app.prompt import build_rag_prompt
from app.models import ChatResponse, SourceResponse, ChatMetadata
import time

class RAGPipeline:
    def __init__(self):
        self.retrieval_pipeline = RetrievalPipeline()
        self.llm = LLM()

    def answer(self, question: str) -> ChatResponse:
        total_start = time.perf_counter()
        retrieval_start = time.perf_counter()

        candidates, top_chunks = self.retrieval_pipeline.run(question, candidate_k=20, rerank_k=5)

        retrieval_pipeline_latency_ms = (
            time.perf_counter() - retrieval_start
        ) * 1000
        dense_latency_ms = self.retrieval_pipeline.last_timings.get("dense_ms", 0.0)
        bm25_latency_ms = self.retrieval_pipeline.last_timings.get("bm25_ms", 0.0)
        rrf_latency_ms = self.retrieval_pipeline.last_timings.get("rrf_ms", 0.0)
        reranker_latency_ms = self.retrieval_pipeline.last_timings.get("reranker_ms", 0.0)

        total_latency_ms = (time.perf_counter() - total_start) * 1000

        if not top_chunks:
            return ChatResponse(
                question=question,
                retrieval_method="Dense + BM25",
                hybrid_candidates=0,
                reranked_count=0,
                sources=[],
                answer="I could not find any relevant information in the documents.",
                metadata=ChatMetadata(
                    dense_latency_ms=dense_latency_ms,
                    bm25_latency_ms=bm25_latency_ms,
                    rrf_latency_ms=rrf_latency_ms,
                    retrieval_pipeline_latency_ms=retrieval_pipeline_latency_ms,
                    reranker_latency_ms=reranker_latency_ms,
                    llm_latency_ms=0.0,
                    total_latency_ms=total_latency_ms,
                    candidate_count=0,
                    reranked_count=0,
                ),
            )

        sources = [
            SourceResponse(
                chunk_id=chunk.chunk_id,
                source=chunk.source,
                score=chunk.score,
                retrieval_method=chunk.retrieval_method,
            )
            for chunk in top_chunks
        ]

        context_blocks = [
            f"[{chunk.source}, chunk {chunk.chunk_id}]\n{chunk.text.strip()}"
            for chunk in top_chunks
        ]
        context_str = "\n\n".join(context_blocks)

        prompt = build_rag_prompt(question, context_str)

        llm_start = time.perf_counter()
        answer_text = self.llm.generate(prompt)
        llm_latency_ms = (time.perf_counter() - llm_start) * 1000
        total_latency_ms = (time.perf_counter() - total_start) * 1000

        return ChatResponse(
            question=question,
            retrieval_method="Dense + BM25",
            hybrid_candidates=len(candidates),
            reranked_count=len(top_chunks),
            sources=sources,
            answer=answer_text,
            metadata=ChatMetadata(
                dense_latency_ms=dense_latency_ms,
                bm25_latency_ms=bm25_latency_ms,
                rrf_latency_ms=rrf_latency_ms,
                retrieval_pipeline_latency_ms=retrieval_pipeline_latency_ms,
                reranker_latency_ms=reranker_latency_ms,
                llm_latency_ms=llm_latency_ms,
                total_latency_ms=total_latency_ms,
                candidate_count=len(candidates),
                reranked_count=len(top_chunks),
            ),
        )
    