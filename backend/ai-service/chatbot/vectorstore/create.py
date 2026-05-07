from typing import List
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
import config.setting as config
import os

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma

from langchain_community.vectorstores import FAISS


class VectorStoreManager:

    def __init__(self):
        self.embeddings = self._init_embeddings()
        self.vector_store = None

    def _init_embeddings(self):
        return HuggingFaceEmbeddings(
            model_name=config.EMBEDDING_MODEL,
            model_kwargs={'device': config.EMBEDDING_DEVICE}
        )

    def create_from_documents(self, documents: List[Document], store_type: str = None):
        store_type = store_type or config.VECTOR_STORE_TYPE

        if store_type == "chroma":
            return self._create_chroma(documents)
        elif store_type == "faiss":
            return self._create_faiss(documents)
        else:
            raise ValueError(f"Unsupported vector store type: {store_type}")

    def _create_chroma(self, documents: List[Document]):
        os.makedirs(config.CHROMA_PERSIST_DIR, exist_ok=True)

        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=config.CHROMA_PERSIST_DIR
        )
        return vector_store

    def _create_faiss(self, documents: List[Document]):
        os.makedirs(os.path.dirname(config.FAISS_INDEX_PATH), exist_ok=True)

        vector_store = FAISS.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        vector_store.save_local(config.FAISS_INDEX_PATH)
        return vector_store

    def load_vector_store(self, store_type: str = None):
        store_type = store_type or config.VECTOR_STORE_TYPE

        if store_type == "chroma":
            return self._load_chroma()
        elif store_type == "faiss":
            return self._load_faiss()
        else:
            raise ValueError(f"Unsupported vector store type: {store_type}")

    def _load_chroma(self):
        if not os.path.exists(config.CHROMA_PERSIST_DIR):
            return None

        return Chroma(
            persist_directory=config.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings
        )

    def _load_faiss(self):
        if not os.path.exists(config.FAISS_INDEX_PATH):
            return None

        return FAISS.load_local(
            config.FAISS_INDEX_PATH,
            self.embeddings,
            allow_dangerous_deserialization=True
        )


def get_vector_store(store_type: str = None):
    manager = VectorStoreManager()
    return manager.load_vector_store(store_type)
