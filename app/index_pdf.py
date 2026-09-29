# app/index_pdf.py
from pathlib import Path
from app.loader import PDFLoader
from app.chunker import TextChunker
from app.embeddings import EmbeddingEngine
from app.vector_store import VectorStore
from app.models import DocumentChunk
from app.retrieval.dense import DenseRetriever

def run_indexing():
    pdf_path = Path(__file__).resolve().parent.parent / "data" / "pdfs" / "machine-learning.pdf"
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    
    print("1. Loading PDF...")
    loader = PDFLoader()
    raw_text = loader.load(pdf_path)

    print("2. Chunking Text...")
    chunks = TextChunker().split(raw_text)
    print(f"Total chunks: {len(chunks)}")

    print("3. Indexing document chunks with dense retrieval...")
    store = VectorStore()
    # Force reset collection to clear out old or corrupted data
    store.create_collection()

    documents = [
        DocumentChunk(chunk_id, chunk, pdf_path.name)
        for chunk_id, chunk in enumerate(chunks, start=1)
    ]
    retriever = DenseRetriever(EmbeddingEngine(), store)
    retriever.index_documents(documents)
    
    print("🎉 Pipeline re-indexed successfully!")

if __name__ == "__main__":
    run_indexing()