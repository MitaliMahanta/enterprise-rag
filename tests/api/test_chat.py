from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.models import ChatResponse, SourceResponse, ChatMetadata


client = TestClient(app)


def test_chat_empty_question():
    response = client.post(
        "/api/v1/chat",
        json={"question": ""},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Question cannot be empty."


def test_document_upload_returns_valid_response():
    pdf_path = "data/pdfs/machine-learning.pdf"

    with open(pdf_path, "rb") as pdf_file:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("machine-learning.pdf", pdf_file, "application/pdf")},
        )

    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"document_id", "filename", "status", "chunks"}
    assert data["filename"] == "machine-learning.pdf"
    assert data["status"] == "indexed"
    assert data["chunks"] > 0


def test_chat_returns_rag_response():
    fake_response = ChatResponse(
        question="What is supervised learning?",
        retrieval_method="Dense + BM25",
        hybrid_candidates=20,
        reranked_count=5,
        sources=[
            SourceResponse(
                chunk_id=42,
                source="machine-learning.pdf",
                score=8.17,
                retrieval_method="reranker",
            )
        ],
        answer="Supervised learning maps an input to an output using example input-output pairs.",
        metadata=ChatMetadata(
        dense_latency_ms=30.0,
        bm25_latency_ms=10.0,
        rrf_latency_ms=2.0,
        retrieval_pipeline_latency_ms=100.0,
        reranker_latency_ms=58.0,
        llm_latency_ms=200.0,
        total_latency_ms=300.0,
        candidate_count=20,
        reranked_count=5,
),
    )

    with patch(
        "app.api.routes_chat.chat_service.process_chat",
        return_value=fake_response,
    ):
        response = client.post(
            "/api/v1/chat",
            json={"question": "What is supervised learning?"},
        )

    assert response.status_code == 200

    data = response.json()

    assert data["question"] == "What is supervised learning?"
    assert data["hybrid_candidates"] == 20
    assert data["reranked_count"] == 5
    assert data["answer"]

    assert len(data["sources"]) == 1
    assert data["sources"][0]["chunk_id"] == 42
    assert data["sources"][0]["source"] == "machine-learning.pdf"
    assert data["sources"][0]["retrieval_method"] == "reranker"

    assert "metadata" in data
    assert data["metadata"]["dense_latency_ms"] == 30.0
    assert data["metadata"]["bm25_latency_ms"] == 10.0
    assert data["metadata"]["rrf_latency_ms"] == 2.0
    assert data["metadata"]["reranker_latency_ms"] == 58.0
    assert data["metadata"]["candidate_count"] == 20
    assert data["metadata"]["reranked_count"] == 5
    assert data["metadata"]["retrieval_pipeline_latency_ms"] == 100.0
    assert data["metadata"]["llm_latency_ms"] == 200.0
    assert data["metadata"]["total_latency_ms"] == 300.0