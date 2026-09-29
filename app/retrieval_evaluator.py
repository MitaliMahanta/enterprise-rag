import json
import time

from embeddings import EmbeddingEngine
from vector_store import VectorStore


class RetrievalEvaluator:

    def __init__(self):

        self.embedding_engine = EmbeddingEngine()
        self.vector_store = VectorStore()

    def evaluate_question(self, question, expected_topic):

        start = time.perf_counter()

        query_vector = self.embedding_engine.embed(question)

        results = self.vector_store.search(
            query_vector,
            limit=5
        )

        latency = time.perf_counter() - start

        matches = []

        for result in results:

            text = result.payload["text"]

            matches.append({
                "score": result.score,
                "contains_expected_topic":
                    expected_topic.lower() in text.lower()
            })

        relevant_count = sum(
        match["contains_expected_topic"]
        for match in matches
        )

        recall = relevant_count / len(matches) if matches else 0.0

        print(
        f"Recall@5: "
        f"{recall:.2f}"
        )
        
        return {
            "question": question,
            "latency": latency,
            "results": matches,
            "recall_at_5": recall
        }