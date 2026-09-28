class TextChunker:

    def split(
        self,
        text,
        size=500,
        overlap=100
    ):

        chunks=[]

        start=0

        while start < len(text):

            end=start+size

            chunks.append(text[start:end])

            start+=size-overlap

        return chunks