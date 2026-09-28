import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.llm import LLM


model = LLM()

answer = model.generate(
    "Explain embeddings in two sentences."
)

print(answer)