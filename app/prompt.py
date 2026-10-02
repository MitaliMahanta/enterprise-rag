# app/prompt.py
def build_rag_prompt(question: str, context_str: str) -> str:
    return f"""Answer the question based ONLY on the following context. If the answer cannot be found in the context, reply exactly with "I could not find this information in the documents."

Context:
{context_str}

Question: {question}

Answer:"""