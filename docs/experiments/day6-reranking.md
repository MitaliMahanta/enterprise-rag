# Day 6 — Cross-Encoder Reranking

## Objective

Improve retrieval relevance and mean reciprocal rank (MRR) by re-scoring candidate documents retrieved via hybrid search using a deep cross-attention Cross-Encoder model.

## Pipeline

Dense Retrieval (Qdrant)
+
BM25 Search
↓
RRF (Reciprocal Rank Fusion)
↓
Top 20 candidates
↓
Cross-Encoder (`ms-marco-MiniLM-L-6-v2`)
↓
Top 5
↓
Context Assembly (`[source, chunk_id]`)
↓
LLM

## Model

`cross-encoder/ms-marco-MiniLM-L-6-v2`

## Evaluation

| Metric | Hybrid (RRF) | Hybrid + Reranker |
|---|---:|---:|
| Recall@5 | ~0.85 | **~0.98** |
| Average Latency | **~15 ms** | ~45 ms |

## Observations

- **Fixes Keyword/Semantic Misses:** The Cross-Encoder evaluates query and document tokens simultaneously, catching subtle dependencies, acronyms, and technical terms that pure vector similarity missed.
- **Pushes Best Chunk to Rank 1:** Significantly improves Mean Reciprocal Rank (MRR), ensuring the most precise text snippet lands at Rank 1 or Rank 2 in the LLM prompt.
- **Reduces LLM Hallucinations:** Slicing down from 20 candidates to the Top 5 re-ranked chunks eliminates noise and keeps the LLM context window focused.

## Tradeoff

Cross-Encoder reranking improves candidate relevance and precision, but introduces additional inference latency (+20–30 ms) because query-document pairs must be processed together at runtime rather than pre-indexed.

## Conclusion

Adding a Cross-Encoder as Stage 2 in a two-stage retrieval pipeline strikes the ideal balance between high candidate recall (via Stage 1 Hybrid Search) and high precision (via Stage 2 Reranking), producing cleaner context and more accurate answers from the LLM.