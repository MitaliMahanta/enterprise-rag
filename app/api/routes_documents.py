from fastapi import APIRouter, File, HTTPException, UploadFile


router = APIRouter(
    prefix="/api/v1/documents",
    tags=["Documents"],
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
):

    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are currently supported.",
        )

    content = await file.read()

    if not content:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(content),
        "message": "PDF received successfully.",
    }