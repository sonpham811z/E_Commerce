from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from ingestion.ingest import DocumentIngester
import config.setting as config

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    try:
        ingester = DocumentIngester()

        results = []
        for file in files:
            file_path = f"{config.DATA_RAW_DIR}/{file.filename}"
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)

            result = ingester.ingest_file(file_path)
            results.append({
                "filename": file.filename,
                "status": "success",
                "chunks": result.get("num_chunks", 0)
            })

        return {
            "message": "Documents uploaded and processed successfully",
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text")
async def upload_text(text: str, metadata: dict = None):
    try:
        ingester = DocumentIngester()
        result = ingester.ingest_text(text, metadata or {})

        return {
            "message": "Text uploaded and processed successfully",
            "chunks": result.get("num_chunks", 0)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
