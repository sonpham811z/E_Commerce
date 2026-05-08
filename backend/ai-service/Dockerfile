FROM python:3.11-slim
WORKDIR /app

# Install build tools + libgomp (required by faiss-cpu) + sqlite3 (required by chromadb)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create writable directories for vector store, data, and logs
RUN mkdir -p chatbot/vectorstore/chromadb chatbot/data/raw logs \
    && chmod -R 777 chatbot/vectorstore chatbot/data logs

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

# Run uvicorn from the chatbot/ subdirectory so relative imports resolve correctly:
# - "from api import ..." resolves to chatbot/api/
# - "from suggest import ..." resolves to ../suggest/ via sys.path added in main.py
WORKDIR /app/chatbot

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
