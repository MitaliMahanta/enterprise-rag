from app.retrieval.reranker import CrossEncoderReranker
from app.models import RetrievedChunk


def main():

    query = "What is the purpose of attention masks?"

    documents = [
        RetrievedChunk(
            chunk_id=1,
            text=(
                "Attention masks are used to prevent the model "
                "from attending to certain tokens."
            ),
            source="transformers.pdf",
            score=0.8,
            retrieval_method="hybrid",
        ),
        RetrievedChunk(
            chunk_id=2,
            text=(
                "BERT is a bidirectional transformer model "
                "used for natural language processing."
            ),
            source="bert.pdf",
            score=0.9,
            retrieval_method="hybrid",
        ),
        RetrievedChunk(
            chunk_id=3,
            text=(
                "Padding tokens can be ignored using an "
                "attention mask during transformer processing."
            ),
            source="attention.pdf",
            score=0.7,
            retrieval_method="hybrid",
        ),
    ]

    reranker = CrossEncoderReranker()

    results = reranker.rerank(
        query=query,
        documents=documents,
        top_k=3,
    )

    print("\nReranked results:\n")

    for rank, result in enumerate(results, start=1):
        print(f"Rank: {rank}")
        print(f"Score: {result.score:.4f}")
        print(f"Source: {result.source}")
        print(f"Chunk ID: {result.chunk_id}")
        print(f"Text: {result.text}")
        print("-" * 80)


if __name__ == "__main__":
    main()