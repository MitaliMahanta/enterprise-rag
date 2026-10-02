from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter(
    prefix="/api/v1/chat",
    tags=["Chat"],
)

chat_service = ChatService()


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    return chat_service.process_chat(
        ChatRequest(question=question)
    )