from app.loader import PDFLoader
from app.chunker import TextChunker
from app.embeddings import EmbeddingEngine
from app.vector_store import VectorStore

def run_indexing():
    # Relative path pointing from root folder to data/pdfs/sodapdf-converted.pdf
    pdf_path = "data/pdfs/sodapdf-converted.pdf" 
    
    print("1. Loading PDF...")
    loader = PDFLoader()
    raw_text = loader.load(pdf_path)

    print("2. Chunking Text...")
    chunks = TextChunker().split(raw_text)
    print(f"Total chunks: {len(chunks)}")
    
    print("3. Generating Embeddings...")
    engine = EmbeddingEngine()
    embeddings = [engine.embed(chunk) for chunk in chunks]

    print("4. Storing in Qdrant...")
    store = VectorStore()
    for chunk, embedding in zip(chunks, embeddings):
        store.add_chunk(embedding, chunk)
    
    print("🎉 Pipeline finished successfully!")

if __name__ == "__main__":
    run_indexing()