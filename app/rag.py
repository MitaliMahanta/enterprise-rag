from embeddings import EmbeddingEngine
from vector_store import VectorStore
from llm import LLM
from prompt import build_prompt
from logging_config import get_logger

logger = get_logger(__name__)

class RAG:

    def __init__(self):

        self.embedding_engine = EmbeddingEngine()
        self.vector_store = VectorStore()
        self.llm = LLM()

    def answer(self, question):
        logger.info("Starting retrieval")
        query_vector = self.embedding_engine.embed(question)

        results = self.vector_store.search(
            query_vector,
            limit=5
        )

        contexts = []
        for i, result in enumerate(results):
            payload = result.payload
            source = payload.get("source", "unknown")
            chunk_id = payload.get("chunk_id", "unknown")
            citation = f"[{source}, chunk {chunk_id}]"
            text = payload.get("text", "")
            print(f"\n--- Retrieved Chunk {i + 1} ---")
            print(f"{citation}\n{text[:500]}")
            contexts.append(f"{citation}\n{text}")

        prompt = build_prompt(
            question,
            contexts
        )

        answer = self.llm.generate(prompt)

        return answer
    