import unittest

from app.models import DocumentChunk
from app.retrieval.bm25 import BM25Retriever


class TestBM25Retriever(unittest.TestCase):
    def setUp(self):
        self.documents = [
            DocumentChunk(1, "BERT is a transformer language model", "bert-test-source"),
            DocumentChunk(2, "LoRA adapts a pretrained model efficiently", "lora-test-source"),
            DocumentChunk(3, "Attention focuses on relevant tokens", "attention-test-source"),
        ]
        self.retriever = BM25Retriever(self.documents)

    def test_search_returns_matching_document_chunks(self):
        results = self.retriever.search("LoRA pretrained", top_k=3)

        self.assertIsInstance(results[0], DocumentChunk)
        self.assertEqual(results[0].chunk_id, 2)
        self.assertEqual(results[0].source, "lora-test-source")

    def test_search_respects_top_k(self):
        results = self.retriever.search("model", top_k=2)

        self.assertEqual(len(results), 2)


if __name__ == "__main__":
    unittest.main()