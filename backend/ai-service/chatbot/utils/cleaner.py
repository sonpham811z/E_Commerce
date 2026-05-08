import re
from typing import List


class TextCleaner:

    @staticmethod
    def clean_text(text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s.,!?;:()\\[\\]{}\'\"-/\u00C0-\u024F\u1E00-\u1EFF]', '', text)
        text = text.strip()
        return text

    @staticmethod
    def clean_documents(documents: List) -> List:
        cleaned = []
        for doc in documents:
            if hasattr(doc, 'page_content'):
                doc.page_content = TextCleaner.clean_text(doc.page_content)
            cleaned.append(doc)
        return cleaned
