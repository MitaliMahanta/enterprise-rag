# app/chat.py
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.rag import RAGPipeline


def main():
    rag = RAGPipeline()
    print("\n🤖 Enterprise RAG Chat Ready! (Type 'exit' or 'quit' to stop)\n")

    while True:
        try:
            question = input("\nYou: ")
            if not question.strip():
                continue
            if question.strip().lower() in ["exit", "quit"]:
                print("\nExiting chat session.")
                break

            # Get structured output from RAG pipeline
            result = rag.answer(question)

            # Format and print structured output
            print("\n--------------------------------------------------")
            print(f"Question:\n{result['question']}\n")
            print(f"Retrieval:\n{result['retrieval_method']}\n")
            print(f"Hybrid candidates:\n{result['hybrid_candidates']}\n")
            print(f"Reranked:\n{result['reranked_count']}\n")

            print("Sources:")
            if result["sources"]:
                for src in result["sources"]:
                    print(src)
            else:
                print("None")

            print(f"\nAnswer:\n{result['answer']}")
            print("--------------------------------------------------")

        except KeyboardInterrupt:
            print("\nExiting chat session.")
            break


if __name__ == "__main__":
    main()

# from .rag import RAG

# rag = RAG()

# print("Enterprise RAG Assistant")
# print("Type 'exit' to quit.")

# while True:

#     question = input("\nYou: ")

#     if question.lower() == "exit":
#         break

#     answer = rag.answer(question)

#     print("\nAssistant:")
#     print(answer)