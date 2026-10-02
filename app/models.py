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
    question: str = Field(
    ..., 
    json_schema_extra={
        "example": "What is the difference between supervised and unsupervised learning?"
    },
)

class SourceResponse(BaseModel):
    chunk_id: int
    source: str
    score: float
    retrieval_method: str

class ChatMetadata(BaseModel):
    dense_latency_ms: float = 0.0
    bm25_latency_ms: float = 0.0
    rrf_latency_ms: float = 0.0
    retrieval_pipeline_latency_ms: float = 0.0
    reranker_latency_ms: float = 0.0
    llm_latency_ms: float = 0.0
    total_latency_ms: float = 0.0
    candidate_count: int = 0
    reranked_count: int = 0

class ChatResponse(BaseModel):
    question: str
    retrieval_method: str
    hybrid_candidates: int
    reranked_count: int
    sources: List[SourceResponse]
    answer: str
    metadata: ChatMetadata


class IndexResponse(BaseModel):
    status: str
    indexed_documents: int