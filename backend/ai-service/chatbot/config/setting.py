import os
from dotenv import load_dotenv

load_dotenv()

MODEL_TYPE = os.getenv("MODEL_TYPE", "groq")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.7"))
GROQ_MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", "2000"))
GROQ_TIMEOUT = float(os.getenv("GROQ_TIMEOUT", "120"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", os.getenv("HUGGINGFACE_API_KEY", ""))
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://router.huggingface.co/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "openai/gpt-oss-120b")
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
OPENAI_TIMEOUT = float(os.getenv("OPENAI_TIMEOUT", "120"))

LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY", "")
LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2", "true")
LANGCHAIN_PROJECT = os.getenv("LANGCHAIN_PROJECT", "nt118-chatbot")

VECTOR_STORE_TYPE = os.getenv("VECTOR_STORE_TYPE", "chroma")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./vectorstore/chromadb")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./vectorstore/faiss_index")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
EMBEDDING_DEVICE = os.getenv("EMBEDDING_DEVICE", "cpu")

TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", "6"))
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.6"))

DATA_RAW_DIR = "./data/raw"
DATA_PROCESSED_DIR = "./data/processed"

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1200"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "250"))

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

STREAMLIT_PORT = int(os.getenv("STREAMLIT_PORT", "8501"))
