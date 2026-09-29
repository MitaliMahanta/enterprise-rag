import argparse
import sys
from pathlib import Path

# Add root directory to sys.path to resolve 'app' imports cleanly
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.embeddings import EmbeddingEngine
from app.vector_store import VectorStore
from app.chunker import TextChunker
from app.loader import PDFLoader
from app.models import DocumentChunk
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.dense import DenseRetriever
from app.retrieval.hybrid import HybridRetriever

DEFAULT_PDF = Path(__file__).resolve().parents[1] / "data" / "pdfs" / "machine-learning.pdf"


def load_documents():
    if not DEFAULT_PDF.is_file():
        raise FileNotFoundError(f"PDF not found: {DEFAULT_PDF}")
    text = PDFLoader().load(DEFAULT_PDF)
    chunks = TextChunker().split(text)
    return [
        DocumentChunk(chunk_id, chunk, DEFAULT_PDF.name)
        for chunk_id, chunk in enumerate(chunks, start=1)
    ]


def search(query: str, top_k: int = 5, retriever_type: str = "dense"):
    if retriever_type in ("bm25", "hybrid"):
        documents = load_documents()
        bm25_retriever = BM25Retriever(documents)
    if retriever_type == "bm25":
        results = bm25_retriever.search(query, top_k=top_k)
    elif retriever_type == "hybrid":
        dense_retriever = DenseRetriever(EmbeddingEngine(), VectorStore())
        retriever = HybridRetriever(dense_retriever, bm25_retriever)
        results = retriever.search(query, top_k=top_k)
    else:
        retriever = DenseRetriever(EmbeddingEngine(), VectorStore())
        results = retriever.search(query, top_k=top_k)

    print(f"\nQuestion:\n{query}\n")
    for idx, hit in enumerate(results, 1):
        if retriever_type in ("bm25", "hybrid"):
            text, source, chunk_id = hit.text, hit.source, hit.chunk_id
        else:
            payload = hit.payload or {}
            text = payload.get("text", "")
            source = payload.get("source", "unknown")
            chunk_id = payload.get("chunk_id", "unknown")
        print(f"Result {idx} [{source}, chunk {chunk_id}]")
        print(f"{text}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--retriever", choices=("dense", "bm25", "hybrid"), default="dense")
    parser.add_argument("--query")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()
    user_query = args.query or input("Enter your question: ")
    search(user_query, top_k=args.top_k, retriever_type=args.retriever)