import sys
import os

# Add parent directory to path so Python can find 'suggest' module
_parent_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api import chat
from api import products as products_api
from api import suggest as suggest_api

try:
    from api import upload
    upload_available = True
except Exception as e:
    print(f"Warning: Upload router not available: {e}")
    upload_available = False
import config.setting as config

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from ingestion.ingest import DocumentIngester
        from vectorstore.create import get_vector_store
        import os

        knowledge_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data", "raw", "ecommerce_knowledge.md"
        )

        vector_store = get_vector_store()
        if vector_store is None and os.path.exists(knowledge_file):
            print("Initializing knowledge base from ecommerce_knowledge.md...")
            ingester = DocumentIngester()
            result = ingester.ingest_file(knowledge_file, {"source": "ShopeeLite Knowledge Base"})
            print(f"Knowledge base initialized: {result['num_chunks']} chunks indexed")
        else:
            print("Knowledge base already exists or file not found, skipping ingestion")
    except Exception as e:
        print(f"Warning: Auto-ingestion skipped: {e}")
    yield

app = FastAPI(
    title="ShopeeLite E-Commerce Chatbot API",
    description="AI-powered e-commerce consultant and customer care chatbot",
    version="2.0.0",
    lifespan=lifespan
)

_origins = [o.strip() for o in config.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
try:
    from api import search
    app.include_router(search.router)
except ImportError as e:
    print(f"Warning: Search router not available: {e}")

if upload_available:
    app.include_router(upload.router)

app.include_router(products_api.router)
app.include_router(suggest_api.router)

@app.get("/")
async def root():
    return {
        "message": "ShopeeLite E-Commerce Chatbot API",
        "model_type": config.MODEL_TYPE,
        "version": "2.0.0"
    }


@app.get("/health")
async def health():
    try:
        from llm.client import get_llm_client
        try:
            client = get_llm_client()
            return {
                "status": "healthy",
                "model_type": config.MODEL_TYPE,
                "llm_configured": True
            }
        except (ValueError, ImportError) as e:
            return {
                "status": "healthy",
                "model_type": config.MODEL_TYPE,
                "llm_configured": False,
                "error": str(e)
            }
    except Exception as e:
        return {
            "status": "healthy",
            "error": str(e)
        }





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=True
    )
