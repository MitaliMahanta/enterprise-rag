from pathlib import Path

from app.chunker import TextChunker
from app.embeddings import EmbeddingEngine
from app.llm import LLM
from app.loader import PDFLoader
from app.models import DocumentChunk
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.dense import DenseRetriever
from app.retrieval.hybrid import HybridRetriever
from app.retrieval.reranker import CrossEncoderReranker
from app.vector_store import VectorStore


class RAGPipeline:

    def __init__(self):
        pdf_path = (Path(__file__).resolve().parent.parent / "data" / "pdfs" / "machine-learning.pdf")
        if not pdf_path.is_file():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        raw_text = PDFLoader().load(pdf_path)
        chunks = TextChunker().split(raw_text)
        documents = [
            DocumentChunk(chunk_id, text, pdf_path.name)
            for chunk_id, text in enumerate(chunks, start=1)
        ]

        dense = DenseRetriever(EmbeddingEngine(), VectorStore())
        bm25 = BM25Retriever(documents)

        self.retriever = HybridRetriever(
            dense_retriever=dense, bm25_retriever=bm25
        )
        self.reranker = CrossEncoderReranker()
        self.llm = LLM()

    def answer(self, question: str) -> dict:
        # 1. Hybrid Retrieval -> Fetch Top 20 Candidates
        candidates = self.retriever.retrieve(question, top_k=20)

        if not candidates:
            return {
                "question": question,
                "retrieval_method": "Dense + BM25",
                "hybrid_candidates": 0,
                "reranked_count": 0,
                "sources": [],
                "answer": "I could not find any relevant information in the documents.",
            }

        # 2. Cross-Encoder Reranking -> Top 5
        top_chunks = self.reranker.rerank(question, candidates, top_k=5)

        # 3. Extract unique source file names
        sources = sorted(list({chunk.source for chunk in top_chunks}))

        # 4. Construct Context String with Citations
        context_blocks = [
            f"[{chunk.source}, chunk {chunk.chunk_id}]\n{chunk.text.strip()}"
            for chunk in top_chunks
        ]
        context_str = "\n\n".join(context_blocks)

        # 5. Build Prompt
        prompt = f"""Answer the question based ONLY on the following context. If the answer cannot be found in the context, reply exactly with "I could not find this information in the documents."

Context:
{context_str}

Question: {question}

Answer:"""

        # 6. Send Prompt to LLM
        llm_response = self.llm.generate(prompt)

        return {
            "question": question,
            "retrieval_method": "Dense + BM25",
            "hybrid_candidates": len(candidates),
            "reranked_count": len(top_chunks),
            "sources": sources,
            "answer": llm_response,
        }
    
# ----------------------------------------------------
# from .embeddings import EmbeddingEngine
# from .vector_store import VectorStore
# from .llm import LLM
# from .prompt import build_prompt
# from .logging_config import get_logger

# logger = get_logger(__name__)

# class RAG:

#     def __init__(self):

#         self.embedding_engine = EmbeddingEngine()
#         self.vector_store = VectorStore()
#         self.llm = LLM()

#     def answer(self, question):
#         logger.info("Starting retrieval")
#         query_vector = self.embedding_engine.embed(question)

#         results = self.vector_store.search(
#             query_vector,
#             limit=5
#         )

#         contexts = []
#         for i, result in enumerate(results):
#             payload = result.payload
#             source = payload.get("source", "unknown")
#             chunk_id = payload.get("chunk_id", "unknown")
#             citation = f"[{source}, chunk {chunk_id}]"
#             text = payload.get("text", "")
#             print(f"\n--- Retrieved Chunk {i + 1} ---")
#             print(f"{citation}\n{text[:500]}")
#             contexts.append(f"{citation}\n{text}")

#         prompt = build_prompt(
#             question,
#             contexts
#         )

#         answer = self.llm.generate(prompt)

#         return answer
    