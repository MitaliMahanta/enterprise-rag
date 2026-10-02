from rank_bm25 import BM25Okapi


class BM25Retriever:

    def __init__(self, documents=None):

        self.documents = documents or []

        tokenized = [
            doc.text.lower().split()
            for doc in self.documents
        ]

        self.index = BM25Okapi(tokenized) if tokenized else None

    def search(self, query, top_k=5):
        if self.index is None:
            return []

        tokens = query.lower().split()

        results = self.index.get_top_n(
            tokens,
            self.documents,
            n=top_k
        )

        return results