from pypdf import PdfReader
from pathlib import Path

class PDFLoader:

    def load(self, path):
        reader = PdfReader(path)
        text = ""

        for page in reader.pages:
            text += page.extract_text()

        return text

# --- RUN / TEST SECTION ---
if __name__ == "__main__":
    loader = PDFLoader()
    pdf_path = Path(__file__).resolve().parent.parent / "data" / "pdfs" / "machine-learning.pdf"
    text = loader.load(pdf_path)
    print(text[:500])