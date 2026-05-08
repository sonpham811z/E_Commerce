from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os

router = APIRouter(prefix="/api/search", tags=["search"])

class AISearchRequest(BaseModel):
    query: str

class AISearchResponse(BaseModel):
    extracted_query: str
    category: Optional[str] = None
    color: Optional[str] = None
    max_price: Optional[int] = None
    min_price: Optional[int] = None

@router.post("/ai-parse", response_model=AISearchResponse)
async def ai_parse(request: AISearchRequest):
    try:
        from llm.client import get_llm_client
        import config.setting as config
        import json
        
        llm_client = get_llm_client(config.MODEL_TYPE)
        
        system_prompt = """Bạn là trợ lý AI chuyên phân tích nhu cầu mua sắm.
Từ câu nói của người dùng, hãy trích xuất các thông tin sau để làm tham số tìm kiếm:
1. "q": Từ khóa tìm kiếm chính (ví dụ: tên sản phẩm, dòng sản phẩm).
2. "category": Tên danh mục nếu có (ví dụ: điện thoại, laptop, thời trang).
3. "color": Màu sắc nếu người dùng đề cập (ví dụ: đen, trắng, đỏ, xanh).
4. "max_price": Mức giá tối đa nếu người dùng đề cập (chỉ số, VND).
5. "min_price": Mức giá tối thiểu nếu người dùng đề cập (chỉ số, VND).

Trả về KẾT QUẢ DUY NHẤT LÀ ĐỊNH DẠNG JSON với các key: q, category, color, max_price, min_price.
Nếu không tìm thấy, để giá trị null. Không giải thích gì thêm.
Ví dụ:
User: Tìm điện thoại pin trâu màu đen giá dưới 10 triệu
JSON: {"q": "điện thoại pin trâu", "category": "điện thoại", "color": "đen", "max_price": 10000000, "min_price": null}
"""
        response_text = llm_client.chat(
            user_message=request.query,
            system_prompt=system_prompt
        )
        
        try:
            clean_text = response_text.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(clean_text)
            
            return AISearchResponse(
                extracted_query=parsed.get("q", request.query) or request.query,
                category=parsed.get("category"),
                color=parsed.get("color"),
                max_price=parsed.get("max_price"),
                min_price=parsed.get("min_price")
            )
        except Exception as json_err:
            print(f"Failed to parse JSON: {response_text}, error: {json_err}")
            return AISearchResponse(extracted_query=request.query)
            
    except Exception as e:
        print(f"AI parse error: {e}")
        return AISearchResponse(extracted_query=request.query)
