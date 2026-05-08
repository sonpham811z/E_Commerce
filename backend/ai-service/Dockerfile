FROM python:3.11-slim
WORKDIR /app

# libgomp1 required by faiss-cpu, sqlite3 required by chromadb
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Writable dirs for vector store, data, logs
RUN mkdir -p chatbot/vectorstore/chromadb chatbot/data/raw logs \
    && chmod -R 777 chatbot/vectorstore chatbot/data logs

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

# Run from chatbot/ so "from api import ..." and "from suggest import ..." resolve correctly:
#   - chatbot/api/  is found via cwd in sys.path
#   - suggest/      is found via _parent_dir (/app) added in main.py
WORKDIR /app/chatbot

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
