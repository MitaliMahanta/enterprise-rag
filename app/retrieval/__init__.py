def __init__(self, dense_retriever, bm25_retriever):
    self.dense = dense_retriever
    self.bm25 = bm25_retriever

    self.last_timings = {
        "dense_ms": 0.0,
        "bm25_ms": 0.0,
        "rrf_ms": 0.0,
    }

    self.last_timings = {}