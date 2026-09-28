from embeddings import EmbeddingEngine

def main():
    print("🚀 Enterprise RAG started")
    embedding_engine = EmbeddingEngine()
    vector = embedding_engine.embed("What is fine tuning?")
    print(len(vector))
    print(vector[:10])

if __name__ == "__main__":
    main()