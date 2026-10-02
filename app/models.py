from dataclasses import dataclass


@dataclass
class DocumentChunk:

    chunk_id: int
    text: str
    source: str
    score: float = 0.0
    retrieval_method: str = "unknown"


RetrievedChunk = DocumentChunk