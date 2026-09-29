from dataclasses import dataclass


@dataclass
class DocumentChunk:

    chunk_id: int
    text: str
    source: str