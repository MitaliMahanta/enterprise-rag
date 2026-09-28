from rag import RAG


rag = RAG()

print("Enterprise RAG Assistant")
print("Type 'exit' to quit.")

while True:

    question = input("\nYou: ")

    if question.lower() == "exit":
        break

    answer = rag.answer(question)

    print("\nAssistant:")
    print(answer)