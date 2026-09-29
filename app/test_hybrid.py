import unittest
from types import SimpleNamespace

from app.models import DocumentChunk
from app.retrieval.hybrid import HybridRetriever


class FakeDenseRetriever:
    def __init__(self, results):
        self.results = results
        self.calls = []

    def search(self, query, top_k):
        self.calls.append((query, top_k))
        return self.results[:top_k]


class FakeBM25Retriever:
    def __init__(self, results):
        self.results = results
        self.calls = []

    def search(self, query, top_k):
        self.calls.append((query, top_k))
        return self.results[:top_k]


class TestHybridRetriever(unittest.TestCase):
    def setUp(self):
        self.dense = FakeDenseRetriever([
            SimpleNamespace(payload={
                "chunk_id": 1,
                "text": "BERT is a transformer language model",
                "source": "bert-test-source",
            }),
            SimpleNamespace(payload={
                "chunk_id": 2,
                "text": "LoRA adapts pretrained models",
                "source": "lora-test-source",
            }),
        ])
        self.bm25_document_2 = DocumentChunk(
            2, "LoRA adapts pretrained models", "lora-test-source"
        )
        self.bm25_document_3 = DocumentChunk(
            3, "Attention focuses on relevant tokens", "attention-test-source"
        )
        self.bm25 = FakeBM25Retriever([
            self.bm25_document_2,
            self.bm25_document_3,
        ])
        self.retriever = HybridRetriever(self.dense, self.bm25)

    def test_fuses_and_deduplicates_results(self):
        results = self.retriever.search("LoRA", top_k=3)

        self.assertEqual([document.chunk_id for document in results], [2, 1, 3])
        self.assertTrue(all(isinstance(document, DocumentChunk) for document in results))
        self.assertEqual(results[0].source, "lora-test-source")

    def test_passes_query_and_top_k_to_both_retrievers(self):
        self.retriever.search("BERT", top_k=2)

        self.assertEqual(self.dense.calls, [("BERT", 2)])
        self.assertEqual(self.bm25.calls, [("BERT", 2)])


if __name__ == "__main__":
    unittest.main()