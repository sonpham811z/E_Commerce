from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Union
from llm.rag import RAGPipeline
from vectorstore.create import get_vector_store
import config.setting as config
import re
import os
import httpx

router = APIRouter(prefix="/api/chat", tags=["chat"])

ECOMMERCE_SYSTEM_PROMPT = """Ban la "ShopAI" - tro ly tu van thuong mai dien tu cua ShopeeLite.
Tra loi bang tieng Viet, than thien va tu nhien nhu dang nhan tin.
TUYET DOI KHONG dung markdown, emoji, icon, dau gach dau dong hay so thu tu.
Ho tro khach hang ve: tim kiem san pham, dat hang, thanh toan, van chuyen, tra hang, voucher, tai khoan.
Neu khong chac chan, huong dan khach lien he hotline ho tro."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    use_rag: bool = True
    top_k: Optional[int] = None


class ProductCard(BaseModel):
    id: Union[str, int]
    name: str
    brand: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    sale_price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    deep_link: str


class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None
    num_sources: Optional[int] = None
    products: Optional[List[ProductCard]] = None


BACKEND_URL = config.BACKEND_URL

PRODUCT_KEYWORDS = [
    "tim", "mua", "san pham", "sản phẩm", "tìm", "giá", "gia",
    "điện thoại", "dien thoai", "laptop", "tai nghe", "giày", "giay",
    "áo", "ao", "quần", "quan", "đồng hồ", "dong ho", "máy tính", "may tinh",
    "phụ kiện", "phu kien", "bàn phím", "ban phim", "chuột", "chuot",
    "túi", "tui", "balo", "gợi ý", "goi y", "đề xuất", "de xuat",
    "recommend", "search", "suggest", "có gì", "co gi", "loại nào", "loai nao",
    "rẻ", "re", "tốt", "tot", "nên mua", "nen mua", "giảm giá", "giam gia",
    "khuyến mãi", "khuyen mai", "voucher",
    "màn hình", "man hinh", "pc", "vga", "ssd", "ram", "cpu", "case",
    "tản nhiệt", "tan nhiet", "chuột", "headphone", "earbuds",
    "aoc", "asus", "msi", "lenovo", "dell", "hp", "acer", "samsung",
    "gearvn", "machenike", "logitech", "razer", "corsair", "kingston",
    "lg", "benq", "hyperx", "steelseries", "nzxt", "be quiet",
]


def is_product_query(message: str) -> bool:
    """Detect if the user message is asking about products."""
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in PRODUCT_KEYWORDS)


STOP_WORDS = {
    "mua", "tim", "tìm", "giá", "gia", "duoi", "dưới", "tren", "trên",
    "khoang", "khoảng", "chuyen", "chuyên", "chong", "chống", "nhe",
    "nhẹ", "dep", "đẹp", "xin", "tot", "tốt", "nen", "nên", "co",
    "có", "muon", "muốn", "một", "mot", "nhung", "nhưng", "cac",
    "các", "hay", "giup", "giúp", "tu", "tư", "van", "vấn", "em",
    "anh", "chi", "chị", "ban", "bạn", "toi", "tôi", "minh", "mình",
    "cho", "vao", "vào", "ra", "cua", "của", "khong", "không",
    "nay", "này", "do", "đó", "the", "thế", "thì", "biết", "biet",
    "cần", "can", "bạn", "tư vấn", "tu van", "và", "hoặc", "hoac",
    "được", "duoc", "về", "ve", "với", "voi", "trong", "ngoai",
    "triệu", "trieu", "tr", "nghìn", "nghin", "k", "củ",
}


CATEGORY_MAP = {
    "man hinh": "monitor", "màn hình": "monitor",
    "laptop": "laptop",
    "ban phim": "keyboard", "bàn phím": "keyboard",
    "chuot": "mouse", "chuột": "mouse",
    "tai nghe": "headset", "headphone": "headset",
    "pc": "pc", "pc gaming": "pc",
    "o cung": "storage", "ổ cứng": "storage", "ssd": "storage", "hdd": "storage",
    "ram": "storage",
    "vga": "gpu", "card do hoa": "gpu", "card đồ họa": "gpu",
    "tan nhiet": "cooling", "tản nhiệt": "cooling",
    "mainboard": "components",
    "nguồn": "components", "psu": "components",
    "case": "components",
}


def _extract_search_keywords(query: str) -> str:
    """Extract meaningful keywords from natural language query."""
    words = query.lower().split()
    keywords = [w for w in words if w not in STOP_WORDS and len(w) > 1]
    return " ".join(keywords) if keywords else query


def _extract_category(query: str):
    """Extract category filter from Vietnamese query."""
    q = query.lower()
    for vi_key, en_cat in CATEGORY_MAP.items():
        if vi_key in q:
            return en_cat
    return None


def _parse_price_filter(query: str):
    """Extract price constraints from Vietnamese query."""
    import re
    max_price = None
    min_price = None

    under_match = re.search(r'(?:dưới|duoi)\s*([\d.]+)\s*(k|nghìn|triệu|tr|củ|trieu)?', query, re.IGNORECASE)
    if under_match:
        val = float(under_match.group(1))
        unit = (under_match.group(2) or 'k').lower()
        if unit in ('triệu', 'tr', 'trieu'):
            val *= 1_000_000
        elif unit in ('k', 'nghìn'):
            val *= 1000
        max_price = val

    over_match = re.search(r'(?:trên|tren)\s*([\d.]+)\s*(k|nghìn|triệu|tr|củ|trieu)?', query, re.IGNORECASE)
    if over_match:
        val = float(over_match.group(1))
        unit = (over_match.group(2) or 'k').lower()
        if unit in ('triệu', 'tr', 'trieu'):
            val *= 1_000_000
        elif unit in ('k', 'nghìn'):
            val *= 1000
        min_price = val

    return min_price, max_price


KNOWN_BRANDS = [
    "msi", "asus", "dell", "hp", "acer", "lenovo", "apple", "samsung",
    "logitech", "razer", "corsair", "kingston", "lg", "benq", "aoc",
    "hyperx", "steelseries", "nzxt", "machenike", "gearvn", "gigabyte",
    "cooler master", "thermaltake", "seasonic", "deepcool", "lian li",
    "western digital", "wd", "seagate", "crucial", "intel", "amd",
]


def _rule_based_parse(query: str) -> dict:
    """Simple rule-based fallback parser."""
    q_lower = query.lower()
    words = q_lower.split()
    keywords = [w for w in words if w not in STOP_WORDS and len(w) > 1]

    category = _extract_category(query)
    if category:
        for vi_key in CATEGORY_MAP:
            cat_words = vi_key.split()
            keywords = [w for w in keywords if w not in cat_words]

    # Detect brand
    brand = None
    for b in KNOWN_BRANDS:
        if b in q_lower:
            brand = b.upper() if len(b) <= 3 else b.title()
            for bw in b.split():
                keywords = [w for w in keywords if w != bw]
            break

    min_price, max_price = _parse_price_filter(query)
    extracted_query = " ".join(keywords) if keywords else query

    return {
        "extracted_query": extracted_query,
        "brand": brand,
        "category": category,
        "min_price": min_price,
        "max_price": max_price,
        "color": None,
        "specs": [],
    }


async def fetch_products_from_backend(query: str, max_results: int = 4) -> List[ProductCard]:
    """Search products from core-service with LLM-based query parsing."""
    try:
        # Use ai-parse endpoint for robust parsing
        parsed = {"extracted_query": _extract_search_keywords(query)}
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                parse_resp = await client.post(
                    f"http://localhost:{config.API_PORT}/api/suggest/ai-parse",
                    json={"query": query},
                )
                if parse_resp.status_code == 200:
                    parsed = parse_resp.json()
        except Exception as e:
            print(f"[chat] ai-parse failed, using rules: {e}")
            parsed = _rule_based_parse(query)

        search_term = parsed.get("extracted_query", _extract_search_keywords(query))
        category = parsed.get("category") or _extract_category(query)
        min_price, max_price = parsed.get("min_price"), parsed.get("max_price")
        if not min_price and not max_price:
            min_price, max_price = _parse_price_filter(query)
        color = parsed.get("color")
        specs = parsed.get("specs", [])
        brand_filter = parsed.get("brand")  # extracted brand name (e.g. "MSI")

        # If brand detected, include it in the search term so ILIKE can match it
        if brand_filter and brand_filter.lower() not in search_term.lower():
            search_term = f"{brand_filter} {search_term}".strip()

        # Remove category keywords from search term to avoid noise
        if category:
            for vi_key in CATEGORY_MAP:
                search_term = search_term.replace(vi_key, "").strip()

        params = {"search": search_term, "limit": max_results * 3}
        if category:
            params["category"] = category
        if min_price:
            params["min_price"] = min_price
        if max_price:
            params["max_price"] = max_price
        if color:
            params["color"] = color
        if specs:
            params["specs"] = ",".join(specs)

        print(f"[chat] Searching products: term='{search_term}', cat={category}, brand={brand_filter}, min={min_price}, max={max_price}, color={color}, specs={specs}")

        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(f"{BACKEND_URL}/api/v1/products", params=params)
            response.raise_for_status()

        data = response.json()
        if isinstance(data, dict) and "success" in data:
            data = data.get("data", {})

        items = []
        if isinstance(data, dict):
            items = data.get("products", data.get("data", data.get("items", [])))
        elif isinstance(data, list):
            items = data

        print(f"[chat] Found {len(items)} products from core-service")

        # Post-filter by brand if requested (core-service ILIKE may return near-misses)
        if brand_filter:
            bf = brand_filter.lower()
            items = [
                it for it in items
                if bf in (it.get("brand") or "").lower()
                or bf in (it.get("title") or it.get("name") or "").lower()
            ]
            print(f"[chat] After brand filter '{brand_filter}': {len(items)} products")

        products = []

        for item in items[:max_results]:
            product_id = item.get("id", 0)
            name = item.get("title") or item.get("name", "")
            price = item.get("sale_price") or item.get("price", 0)
            image = item.get("image")
            rating = item.get("rating")
            brand = item.get("brand")
            original_price = item.get("original_price")
            sale_price = item.get("sale_price")
            category = item.get("category") or item.get("category_name")

            # Keep UUID string as-is; only convert numeric strings to int
            if isinstance(product_id, str):
                try:
                    product_id = int(product_id)  # numeric string like "123"
                except ValueError:
                    pass  # real UUID — leave as string

            products.append(ProductCard(
                id=product_id,
                name=name,
                brand=brand,
                price=float(price) if price else 0,
                original_price=float(original_price) if original_price else None,
                sale_price=float(sale_price) if sale_price else None,
                category=category,
                image=image,
                rating=rating,
                deep_link=f"/product/{product_id}"
            ))
        return products
    except Exception as e:
        print(f"Failed to fetch products from core-service: {e}")
        return []


_rag_pipeline = None


def get_rag_pipeline():
    global _rag_pipeline

    if _rag_pipeline is None:
        vector_store = get_vector_store()
        _rag_pipeline = RAGPipeline(vector_store, config.MODEL_TYPE)

    return _rag_pipeline


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    import traceback
    try:
        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })

        is_product = is_product_query(request.message)
        products = None

        if is_product:
            products = await fetch_products_from_backend(request.message, max_results=4)

        product_context = ""
        if products and len(products) > 0:
            product_context = "\n\nSan pham tim thay trong kho cua hang:\n"
            for p in products:
                brand_str = f", hang: {p.brand}" if p.brand else ""
                cat_str = f", danh muc: {p.category}" if p.category else ""
                price_str = f"{int(p.sale_price or p.price):,}d" if (p.sale_price or p.price) else "Lien he"
                orig_str = f" (goc: {int(p.original_price):,}d)" if p.original_price and p.original_price != (p.sale_price or p.price) else ""
                rating_str = f", danh gia: {p.rating}/5" if p.rating else ""
                product_context += f"- {p.name}{brand_str}{cat_str}, gia: {price_str}{orig_str}{rating_str}, link: {p.deep_link}\n"
            product_context += "Hay goi y nhung san pham tren cho khach, ke ten, hang, gia va kem link. Neu khong phu hop thi tu van them."

        answer = None

        if request.use_rag:
            try:
                rag_pipeline = get_rag_pipeline()
                result = rag_pipeline.query(
                    query=request.message,
                    conversation_history=history,
                    top_k=request.top_k
                )
                answer = result["answer"]
                if product_context:
                    answer += f"\n\nMình tìm thấy một số sản phẩm phù hợp, bạn xem bên dưới nhé!"
            except Exception as e:
                print(f"RAG failed, falling back to direct LLM: {e}")

        if answer is None:
            from llm.client import get_llm_client
            try:
                llm_client = get_llm_client(config.MODEL_TYPE)

                system_prompt = ECOMMERCE_SYSTEM_PROMPT
                if product_context:
                    system_prompt += product_context

                answer = llm_client.chat(
                    user_message=request.message,
                    conversation_history=history,
                    system_prompt=system_prompt
                )
            except ValueError as e:
                print(f"ValueError in chat: {e}")
                return ChatResponse(
                    answer="Xin loi ban, ShopAI tam thoi khong the ket noi. Vui long thu lai sau it phut nhe!",
                    sources=None, num_sources=0, products=products
                )
            except ImportError as e:
                print(f"ImportError in chat: {e}")
                return ChatResponse(
                    answer="He thong dang bao tri, ShopAI se quay lai som. Ban co the lien he hotline 1900-xxxx de duoc ho tro ngay!",
                    sources=None, num_sources=0, products=products
                )
            except Exception as e:
                traceback.print_exc()
                print(f"LLM error: {e}")
                return ChatResponse(
                    answer="Xin loi ban, ShopAI dang gap su co ky thuat. Vui long thu lai sau hoac lien he bo phan ho tro qua hotline 1900-xxxx nhe!",
                    sources=None, num_sources=0, products=products
                )

        return ChatResponse(
            answer=answer,
            sources=None,
            num_sources=0,
            products=products
        )

    except HTTPException:
        raise
    except Exception as e:
        error_detail = str(e)
        traceback.print_exc()
        print(f"Unexpected error in chat endpoint: {error_detail}")
        return ChatResponse(
            answer="ShopAI xin loi vi su bat tien. He thong dang duoc khac phuc. Ban vui long thu lai sau nhe!",
            sources=None,
            num_sources=0,
            products=None
        )


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    try:
        rag_pipeline = get_rag_pipeline()

        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })

        if request.use_rag:
            from fastapi.responses import StreamingResponse
            import json

            def generate():
                for chunk in rag_pipeline.stream_query(
                    query=request.message,
                    conversation_history=history,
                    top_k=request.top_k
                ):
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            return StreamingResponse(generate(), media_type="text/event-stream")
        else:
            from fastapi.responses import StreamingResponse
            from llm.client import get_llm_client
            import json

            llm_client = get_llm_client(config.MODEL_TYPE)

            def generate():
                for chunk in llm_client.stream_chat(
                    user_message=request.message,
                    conversation_history=history,
                    system_prompt=ECOMMERCE_SYSTEM_PROMPT
                ):
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
