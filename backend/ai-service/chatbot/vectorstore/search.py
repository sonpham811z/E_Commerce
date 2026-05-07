from typing import List, Dict
from langchain_core.documents import Document
from vectorstore.create import get_vector_store
import config.setting as config


class VectorStoreSearch:

    def __init__(self, vector_store=None):
        self.vector_store = vector_store or get_vector_store()

    def search(self, query: str, top_k: int = None, filter_dict: Dict = None) -> List[Document]:
        top_k = top_k or config.TOP_K_RESULTS

        if hasattr(self.vector_store, 'similarity_search'):
            if filter_dict:
                return self.vector_store.similarity_search(query, k=top_k, filter=filter_dict)
            else:
                return self.vector_store.similarity_search(query, k=top_k)
        else:
            retriever = self.vector_store.as_retriever(search_kwargs={"k": top_k})
            return retriever.invoke(query)

    def search_with_score(self, query: str, top_k: int = None, filter_dict: Dict = None) -> List[tuple]:
        top_k = top_k or config.TOP_K_RESULTS

        if hasattr(self.vector_store, 'similarity_search_with_score'):
            if filter_dict:
                return self.vector_store.similarity_search_with_score(query, k=top_k, filter=filter_dict)
            else:
                return self.vector_store.similarity_search_with_score(query, k=top_k)
        else:
            docs = self.search(query, top_k, filter_dict)
            return [(doc, 1.0) for doc in docs]

    def filter_by_threshold(self, results: List[tuple], threshold: float = None) -> List[Document]:
        threshold = threshold or config.SIMILARITY_THRESHOLD

        filtered = []
        for doc, score in results:
            if score >= threshold:
                filtered.append(doc)

        return filtered
