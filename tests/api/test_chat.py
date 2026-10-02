from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.models import ChatResponse, SourceResponse


client = TestClient(app)


def test_chat_empty_question():
    response = client.post(
        "/api/v1/chat",
        json={"question": ""},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Question cannot be empty."


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