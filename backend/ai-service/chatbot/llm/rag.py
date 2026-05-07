from typing import List, Dict, Optional
from langchain_core.documents import Document
from llm.client import get_llm_client
import config.setting as config


class RAGPipeline:

    def __init__(self, vector_store, model_type: Optional[str] = None):
        self.vector_store = vector_store
        self.model_type = model_type
        self._llm_client = None
        self.system_prompt = self._create_system_prompt()

    @property
    def llm_client(self):
        if self._llm_client is None:
            self._llm_client = get_llm_client(self.model_type)
        return self._llm_client

    def _create_system_prompt(self) -> str:
        return """Ban la "ShopAI" - tro ly tu van thuong mai dien tu cua ShopeeLite.

VAI TRO: Tu van san pham, cham soc khach hang, huong dan su dung app, chia se meo mua sam.

QUY TAC DINH DANG BAT BUOC:
- TUYET DOI KHONG su dung markdown (khong dung **, *, #, ```, ---, hay bat ky ky hieu dinh dang nao)
- TUYET DOI KHONG su dung emoji hoac icon
- KHONG dung dau gach dau dong (-) hoac so thu tu (1. 2. 3.) de liet ke
- Viet cau tra loi nhu dang nhan tin chat binh thuong, tu nhien, than thien
- Neu can liet ke nhieu y, viet thanh cac cau van lien mach hoac xuong dong don gian
- Giu cau tra loi ngan gon, di thang vao van de

NGUYEN TAC:
- Tra loi bang tieng Viet, than thien nhu nhan vien CSKH
- Khi khach gap van de, thau hieu va chu dong dua ra giai phap
- Neu khong chac chan, huong dan khach lien he bo phan ho tro

THONG TIN THAM KHAO:
{context}

LUU Y:
- Uu tien dung thong tin tu context
- Khong tu y dua ra thong tin sai
- Nhac khach kiem tra gia truc tiep tren app vi gia co the thay doi
"""

    def retrieve(self, query: str, top_k: int = None) -> List[Document]:
        if self.vector_store is None:
            return []
        top_k = top_k or config.TOP_K_RESULTS
        retriever = self.vector_store.as_retriever(
            search_kwargs={"k": top_k}
        )
        return retriever.invoke(query)

    def format_context(self, documents: List[Document]) -> str:
        if not documents:
            return "Khong tim thay thong tin lien quan trong co so du lieu. Hay tra loi dua tren kien thuc chung ve thuong mai dien tu."

        context_parts = []
        for i, doc in enumerate(documents, 1):
            content = doc.page_content
            metadata = doc.metadata
            source = metadata.get("source", "ShopeeLite Knowledge Base")
            context_parts.append(f"[{i}] {content}\nNguon: {source}")

        return "\n\n".join(context_parts)

    def generate_answer(
        self,
        query: str,
        context: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        prompt = self.system_prompt.format(context=context)

        messages = []
        if conversation_history:
            for msg in conversation_history[-5:]:
                if msg["role"] == "user":
                    messages.append({"role": "user", "content": msg["content"]})
                elif msg["role"] == "assistant":
                    messages.append({"role": "assistant", "content": msg["content"]})

        messages.append({"role": "user", "content": query})

        return self.llm_client.chat(
            user_message=query,
            conversation_history=messages,
            system_prompt=prompt
        )

    def stream_answer(
        self,
        query: str,
        context: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ):
        prompt = self.system_prompt.format(context=context)

        messages = []
        if conversation_history:
            for msg in conversation_history[-5:]:
                if msg["role"] == "user":
                    messages.append({"role": "user", "content": msg["content"]})
                elif msg["role"] == "assistant":
                    messages.append({"role": "assistant", "content": msg["content"]})

        messages.append({"role": "user", "content": query})

        return self.llm_client.stream_chat(
            user_message=query,
            conversation_history=messages,
            system_prompt=prompt
        )

    def query(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        top_k: int = None
    ) -> Dict[str, any]:
        documents = self.retrieve(query, top_k)
        context = self.format_context(documents)
        answer = self.generate_answer(query, context, conversation_history)

        return {
            "answer": answer,
            "context": context,
            "sources": [doc.metadata.get("source", "ShopeeLite Knowledge Base") for doc in documents],
            "num_sources": len(documents)
        }

    def stream_query(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        top_k: int = None
    ):
        documents = self.retrieve(query, top_k)
        context = self.format_context(documents)

        for chunk in self.stream_answer(query, context, conversation_history):
            yield chunk
