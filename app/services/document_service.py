from pathlib import Path

from pypdf import PdfReader

from app.models import DocumentChunk
from app.retrieval.dense import DenseRetriever, EmbeddingEngine, VectorStore


class DocumentService:
    def _resolve_pdf_dir(self, pdf_dir: str | Path) -> Path:
        path = Path(pdf_dir)

        if path.is_absolute():
            return path

        return (Path(__file__).resolve().parents[2] / path).resolve()

    def load_documents(
        self,
        pdf_dir: str = "data/pdfs",
    ) -> list[DocumentChunk]:
        documents = []
        chunk_id = 1

        pdf_root = self._resolve_pdf_dir(pdf_dir)

        for pdf_path in sorted(pdf_root.glob("*.pdf")):
            pdf_documents = self.load_pdf(
                pdf_path,
                start_chunk_id=chunk_id,
            )

            documents.extend(pdf_documents)
            chunk_id += len(pdf_documents)

        return documents

    def load_pdf(
        self,
        pdf_path: str | Path,
        start_chunk_id: int = 1,
    ) -> list[DocumentChunk]:

        pdf_path = Path(pdf_path)

        reader = PdfReader(pdf_path)

        text = "".join(
            page.extract_text() or ""
            for page in reader.pages
        )

        return [
            DocumentChunk(
                chunk_id=chunk_id,
                text=chunk,
                source=pdf_path.name,
            )
            for chunk_id, chunk in enumerate(
                self._split_text(text),
                start=start_chunk_id,
            )
        ]

    def ingest_pdf(
        self,
        pdf_path: str | Path,
    ) -> int:

        pdf_path = Path(pdf_path)

        documents = self.load_pdf(pdf_path)

        if not documents:
            return 0

        store = VectorStore()

        retriever = DenseRetriever(
            EmbeddingEngine(),
            store,
        )

        retriever.index_documents(documents)

        return len(documents)

    @staticmethod
    def _split_text(
        text: str,
        size: int = 500,
        overlap: int = 100,
    ) -> list[str]:

        chunks = []
        start = 0

        while start < len(text):
            chunks.append(
                text[start : start + size]
            )

            start += size - overlap

        return chunks

    def reindex_documents(
        self,
        pdf_dir: str = "data/pdfs",
    ) -> int:

        documents = self.load_documents(pdf_dir)

        if documents:
            store = VectorStore()

            store.create_collection()

            retriever = DenseRetriever(
                EmbeddingEngine(),
                store,
            )

            retriever.index_documents(documents)

        return len(documents)