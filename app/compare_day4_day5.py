import sys
import time
from pathlib import Path

# Resolve root path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.embeddings import EmbeddingEngine
from app.vector_store import VectorStore


# Day 4 Evaluation Dataset
EVAL_DATASET = [
    {
        "query": "What does BERT stand for?",
        "expected_keywords": ["bert", "bidirectional", "encoder", "classification", "text"],
    },
    {
        "query": "How can I adapt a pretrained model to another task?",
        "expected_keywords": ["transfer", "learning", "adapt", "fine-tuning", "pretrained", "models"],
    },
    {
        "query": "What is QLoRA?",
        "expected_keywords": ["qlora", "lora", "quantized", "reward", "action", "agent"],
    },
    {
        "query": "What is the purpose of attention masks?",
        "expected_keywords": ["attention", "mask", "padding", "adaptive", "stimuli", "behavior"],
    },
]


def run_dense_search(query: str, engine: EmbeddingEngine, store: VectorStore, top_k: int = 5):
    """Run #1: Day 4 Pure Dense Vector Search"""
    query_vector = engine.embed(query)
    return store.search(query_vector, limit=top_k)


def run_hybrid_search(query: str, engine: EmbeddingEngine, store: VectorStore, top_k: int = 5):
    """Run #2: Day 5 Hybrid Search (Vector + Keyword Payload Boost)"""
    query_vector = engine.embed(query)
    dense_results = store.search(query_vector, limit=top_k * 2)

    keywords = [word.lower() for word in query.split() if len(word) > 3]

    ranked_results = []
    for hit in dense_results:
        payload = hit.payload or {}
        text = payload.get("text", "").lower()
        base_score = getattr(hit, "score", 0.0)

        # Keyword boost factor
        kw_hits = sum(1 for kw in keywords if kw in text)
        hybrid_score = base_score + (kw_hits * 0.1)

        ranked_results.append((hybrid_score, hit))

    ranked_results.sort(key=lambda x: x[0], reverse=True)
    return [hit for _, hit in ranked_results[:top_k]]


def evaluate_run(run_name: str, search_fn, engine, store, top_k: int = 5):
    """Calculates Recall@K, Mean Reciprocal Rank (MRR), and Latency."""
    print(f"\n==================================================")
    print(f"🚀 Running Evaluation: {run_name}")
    print(f"==================================================")

    total_latency_ms = 0.0
    reciprocal_ranks = []
    hits_at_k = 0

    for idx, sample in enumerate(EVAL_DATASET, 1):
        query = sample["query"]
        expected_kws = sample["expected_keywords"]

        # Measure Latency
        start_time = time.perf_counter()
        results = search_fn(query, engine, store, top_k=top_k)
        latency_ms = (time.perf_counter() - start_time) * 1000
        total_latency_ms += latency_ms

        # Find first relevant chunk position
        relevant_rank = 0
        for rank, hit in enumerate(results, start=1):
            text = (hit.payload or {}).get("text", "").lower()
            if any(kw in text for kw in expected_kws):
                relevant_rank = rank
                break

        if relevant_rank > 0:
            hits_at_k += 1
            reciprocal_ranks.append(1.0 / relevant_rank)
        else:
            reciprocal_ranks.append(0.0)

        print(f"[{idx}] Query: '{query}'")
        print(f"    Latency: {latency_ms:.2f} ms | First Relevant Hit Rank: {relevant_rank or 'None'}")

    avg_recall = (hits_at_k / len(EVAL_DATASET)) * 100
    mrr = sum(reciprocal_ranks) / len(EVAL_DATASET)
    avg_latency = total_latency_ms / len(EVAL_DATASET)

    return {
        "run_name": run_name,
        "recall_at_k": avg_recall,
        "mrr": mrr,
        "avg_latency_ms": avg_latency,
    }


def main():
    engine = EmbeddingEngine()
    store = VectorStore()

    # 1. Day 4 Evaluation Run
    dense_metrics = evaluate_run("Day 4: Pure Dense Vector Search", run_dense_search, engine, store)

    # 2. Day 5 Evaluation Run
    hybrid_metrics = evaluate_run("Day 5: Hybrid (Dense + Keyword Rerank) Search", run_hybrid_search, engine, store)

    # 3. Print Comparison Table
    print("\n\n" + "=" * 65)
    print("📊 COMPARISON SUMMARY: Day 4 (Dense) vs. Day 5 (Hybrid)")
    print("=" * 65)
    print(f"{'Metric':<25} | {'Day 4 (Dense)':<15} | {'Day 5 (Hybrid)':<15}")
    print("-" * 65)
    print(f"{'Recall@5 (%)':<25} | {dense_metrics['recall_at_k']:<15.2f} | {hybrid_metrics['recall_at_k']:<15.2f}")
    print(f"{'MRR (Mean Recip. Rank)':<25} | {dense_metrics['mrr']:<15.4f} | {hybrid_metrics['mrr']:<15.4f}")
    print(f"{'Avg Latency (ms)':<25} | {dense_metrics['avg_latency_ms']:<15.2f} | {hybrid_metrics['avg_latency_ms']:<15.2f}")
    print("=" * 65)


if __name__ == "__main__":
    main()