# Enterprise RAG

A production-grade Retrieval Augmented Generation (RAG) system built in Python.

## Objective

Build an Pulse AI assistant capable of answering questions from company documents using semantic search, vector databases, and large language models.

## Tech Stack

- Python 3.13
- Sentence Transformers
- Qdrant
- Ollama
- FastAPI
- Streamlit

---

## Getting Started

### 1. Run Qdrant Vector Store

Ensure Qdrant is running locally via Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant

2. Index Documents & Search
    1.Place your target PDF into data/pdfs/ (e.g., data/pdfs/machine-learning.pdf).

    2.Run the indexing pipeline:
    python -m app.index_pdf

    3.Run the interactive search script to query indexed vectors with citations:
    python -m app.search

Project Roadmap
[x] Environment setup

[x] Semantic Search

[ ] RAG Chatbot

[ ] GraphRAG

[ ] Multi-Agent System

[ ] vLLM Backend

[ ] Voice AI