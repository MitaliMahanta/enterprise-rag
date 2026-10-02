from datetime import datetime, timezone


class DocumentRegistry:
    def __init__(self):
        self.documents = {}

    def add(
        self,
        document_id: str,
        filename: str,
        chunks: int,
        status: str,
    ):
        self.documents[document_id] = {
            "document_id": document_id,
            "filename": filename,
            "status": status,
            "chunks": chunks,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def get(self, document_id: str):
        return self.documents.get(document_id)

    def list(self):
        return list(self.documents.values())

    def delete(self, document_id: str):
        return self.documents.pop(document_id, None)


document_registry = DocumentRegistry()