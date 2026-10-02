# app/models.py
from typing import List, Optional
from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    chunk_id: int
    text: str
    source: str


class RetrievedChunk(DocumentChunk):
    score: float = 0.0
    retrieval_method: str = "hybrid"


class ChatRequest(BaseModel):
    question: str = Field(..., example="What is the difference between supervised and unsupervised learning?")

class SourceResponse(BaseModel):
    chunk_id: int
    source: str
    score: float
    retrieval_method: str
    
class ChatResponse(BaseModel):
    question: str
    retrieval_method: str
    hybrid_candidates: int
    reranked_count: int
    sources: List[SourceResponse]
    answer: str


class IndexResponse(BaseModel):
    status: str
    indexed_documents: int