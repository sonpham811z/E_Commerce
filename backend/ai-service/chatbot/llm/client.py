import os
from typing import List, Dict, Optional
try:
    from langchain_groq import ChatGroq
except ImportError:
    ChatGroq = None
try:
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatOpenAI = None
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
import config.setting as config


class LLMClient:

    def __init__(self, model_type: Optional[str] = None):
        self.model_type = model_type or config.MODEL_TYPE
        self.llm = self._initialize_llm()

    def _initialize_llm(self):
        if self.model_type == "groq":
            return self._init_groq()
        elif self.model_type == "openai":
            return self._init_openai()
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")

    def _init_groq(self):
        if ChatGroq is None:
            raise ImportError("langchain-groq is not installed. Run: pip install langchain-groq")

        if not config.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is required")

        if config.LANGCHAIN_API_KEY:
            os.environ["LANGCHAIN_API_KEY"] = config.LANGCHAIN_API_KEY
            os.environ["LANGCHAIN_TRACING_V2"] = config.LANGCHAIN_TRACING_V2
            os.environ["LANGCHAIN_PROJECT"] = config.LANGCHAIN_PROJECT

        return ChatGroq(
            model=config.GROQ_MODEL,
            api_key=config.GROQ_API_KEY,
            temperature=config.GROQ_TEMPERATURE,
            max_tokens=config.GROQ_MAX_TOKENS,
            timeout=config.GROQ_TIMEOUT,
            max_retries=2,
        )

    def _init_openai(self):
        if ChatOpenAI is None:
            raise ImportError("langchain-openai is not installed. Run: pip install langchain-openai")

        if not config.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY or HUGGINGFACE_API_KEY is required")

        if config.LANGCHAIN_API_KEY:
            os.environ["LANGCHAIN_API_KEY"] = config.LANGCHAIN_API_KEY
            os.environ["LANGCHAIN_TRACING_V2"] = config.LANGCHAIN_TRACING_V2
            os.environ["LANGCHAIN_PROJECT"] = config.LANGCHAIN_PROJECT

        return ChatOpenAI(
            model=config.OPENAI_MODEL,
            api_key=config.OPENAI_API_KEY,
            base_url=config.OPENAI_BASE_URL,
            temperature=config.OPENAI_TEMPERATURE,
            max_tokens=config.OPENAI_MAX_TOKENS,
            timeout=config.OPENAI_TIMEOUT,
            max_retries=2,
            streaming=True,
        )

    def generate(
        self,
        messages: List[BaseMessage],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        if system_prompt:
            messages = [SystemMessage(content=system_prompt)] + messages

        response = self.llm.invoke(messages)
        return response.content

    def stream_generate(
        self,
        messages: List[BaseMessage],
        system_prompt: Optional[str] = None,
        **kwargs
    ):
        if system_prompt:
            messages = [SystemMessage(content=system_prompt)] + messages

        for chunk in self.llm.stream(messages):
            if hasattr(chunk, 'content'):
                yield chunk.content
            else:
                yield str(chunk)

    def chat(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> str:
        messages = []

        if conversation_history:
            for msg in conversation_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))

        messages.append(HumanMessage(content=user_message))

        return self.generate(messages, system_prompt, **kwargs)

    def stream_chat(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None,
        **kwargs
    ):
        messages = []

        if conversation_history:
            for msg in conversation_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))

        messages.append(HumanMessage(content=user_message))

        return self.stream_generate(messages, system_prompt, **kwargs)


def get_llm_client(model_type: Optional[str] = None) -> LLMClient:
    return LLMClient(model_type)
