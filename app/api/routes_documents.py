from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models import DocumentUploadResponse
from app.services.document_service import DocumentService
from app.services.document_registry import document_registry


router = APIRouter(
    prefix="/api/v1/documents",
    tags=["Documents"],
)


UPLOAD_DIR = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "uploads"
)

MAX_UPLOAD_SIZE_MB = 20


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
)
async def upload_document(
    file: UploadFile = File(...),
):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are currently supported.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    max_size = MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File exceeds the maximum allowed size "
                f"of {MAX_UPLOAD_SIZE_MB} MB."
            ),
        )

    document_id = str(uuid4())

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    safe_filename = Path(file.filename).name

    stored_filename = (
        f"{document_id}_{safe_filename}"
    )

    file_path = UPLOAD_DIR / stored_filename

    file_path.write_bytes(content)

    try:
        chunks = DocumentService().ingest_pdf(
            file_path
        )
    except Exception as exc:
        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=500,
            detail=f"Document ingestion failed: {exc}",
        )

    document_registry.add(
        document_id=document_id,
        filename=safe_filename,
        chunks=chunks,
        status="indexed",
    )

    return {
        "document_id": document_id,
        "filename": safe_filename,
        "status": "indexed",
        "chunks": chunks,
    }

@router.get("")
def list_documents():
    return {
        "documents": document_registry.list()
    }


@router.get("/{document_id}")
def get_document(document_id: str):
    document = document_registry.get(document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return document