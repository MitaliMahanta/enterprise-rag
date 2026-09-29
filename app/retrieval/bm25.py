from rank_bm25 import BM25Okapi


class BM25Retriever:

    def __init__(self, documents):

        self.documents = documents

        tokenized = [
            doc.text.lower().split()
            for doc in documents
        ]

        self.index = BM25Okapi(tokenized)

    def search(self, query, top_k=5):

        tokens = query.lower().split()

        results = self.index.get_top_n(
            tokens,
            self.documents,
            n=top_k
        )

        return results