from app.rag import RAGPipeline
from app.models import ChatRequest, ChatResponse


class ChatService:
    def __init__(self):
        self.rag = RAGPipeline()

    def process_chat(self, request: ChatRequest) -> ChatResponse:
        return self.rag.answer(request.question)