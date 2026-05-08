from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
import sys

# Ensure stdout can handle Vietnamese (UTF-8) characters on Windows cp1252 terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from suggest import (
    get_cross_sell_suggestions,
    get_similar_products,
    get_combo_suggestion,
    get_cart_status_suggestions,
    calculate_product_score,
    rank_products_by_score,
    get_personalized_filter,
)

router = APIRouter(prefix="/api/suggest", tags=["suggestions"])

CORE_SERVICE_URL = os.getenv("CORE_SERVICE_URL", "http://localhost:3003")


class SearchSuggestRequest(BaseModel):
    q: str
    limit: int = 10


class CrossSellRequest(BaseModel):
    category: str


class SimilarRequest(BaseModel):
    product_id: int
    price_margin: float = 0.2


class CartSuggestRequest(BaseModel):
    items: List[dict]


class ScoreRequest(BaseModel):
    products: List[dict]
    user_profile: dict


async def _fetch_catalog(category: str = None, limit: int = 50):
    params = {"limit": limit}
    if category:
        params["category"] = category
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{CORE_SERVICE_URL}/api/v1/products", params=params)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("data", {})
            if isinstance(items, dict):
                return items.get("products", items.get("data", []))
            return items if isinstance(items, list) else []
    except Exception as e:
        print(f"Error fetching catalog: {e}")
        return []


async def _fetch_product(product_id: int):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{CORE_SERVICE_URL}/api/v1/products/{product_id}")
            resp.raise_for_status()
            data = resp.json()
            return data.get("data", data)
    except Exception as e:
        print(f"Error fetching product {product_id}: {e}")
        return None


CATEGORY_ALIASES = {
    "ổ cứng": ["ssd", "hdd", "linh kiện", "storage", "ổ cứng"],
    "ssd": ["ssd", "linh kiện", "storage", "ổ cứng"],
    "hdd": ["hdd", "linh kiện", "storage", "ổ cứng"],
    "ram": ["ram", "linh kiện", "bộ nhớ"],
    "vga": ["vga", "card màn hình", "linh kiện", "đồ họa"],
    "card đồ họa": ["vga", "card màn hình", "linh kiện", "đồ họa"],
    "cpu": ["cpu", "linh kiện", "processor", "bộ vi xử lý"],
    "mainboard": ["mainboard", "linh kiện", "bo mạch chủ"],
    "nguồn": ["nguồn", "psu", "linh kiện", "power supply"],
    "case": ["case", "linh kiện", "vỏ máy"],
    "tản nhiệt": ["tản nhiệt", "cooler", "linh kiện", "aio"],
    "laptop": ["laptop", "laptop gaming"],
    "màn hình": ["màn hình", "monitor"],
    "bàn phím": ["bàn phím", "keyboard"],
    "chuột": ["chuột", "mouse", "gaming"],
    "tai nghe": ["tai nghe", "headphone", "headset"],
    "pc": ["pc", "pc gaming", "desktop"],
}


def _expand_query(query: str) -> list:
    """Expand query with category aliases for broader matching."""
    q = query.lower().strip()
    keywords = [q]
    for alias, expansions in CATEGORY_ALIASES.items():
        if alias in q:
            keywords.extend(expansions)
    return list(set(keywords))


def _parse_price_filter(query: str):
    """Extract price constraints from Vietnamese query like 'dưới 500k', 'trên 1 triệu'."""
    import re
    max_price = None
    min_price = None

    under_match = re.search(r'dưới\s+([\d.]+)\s*(k|nghìn|triệu|tr)?', query)
    if under_match:
        val = float(under_match.group(1))
        unit = (under_match.group(2) or 'k').lower()
        if unit in ('triệu', 'tr'):
            val *= 1_000_000
        elif unit in ('k', 'nghìn'):
            val *= 1000
        max_price = val

    over_match = re.search(r'trên\s+([\d.]+)\s*(k|nghìn|triệu|tr)?', query)
    if over_match:
        val = float(over_match.group(1))
        unit = (over_match.group(2) or 'k').lower()
        if unit in ('triệu', 'tr'):
            val *= 1_000_000
        elif unit in ('k', 'nghìn'):
            val *= 1000
        min_price = val

    return min_price, max_price


@router.get("/search")
async def search_suggestions(q: str, limit: int = 10):
    """AI-enhanced search: fetch products from core-service, score and rank them."""
    if not q or not q.strip():
        return {"success": True, "data": []}

    catalog = await _fetch_catalog(limit=200)
    if not catalog:
        return {"success": True, "data": []}

    query_lower = q.lower().strip()
    keywords = _expand_query(query_lower)
    min_price, max_price = _parse_price_filter(query_lower)

    # --- Brand detection ---
    # 1) Explicit pattern: "thương hiệu X" or "hãng X"
    import re as _re
    brand_filter = None
    brand_pattern = _re.search(
        r'(?:th\u01b0\u01a1ng hi\u1ec7u|thuong hieu|h\u00e3ng|hang)\s*[:\s]\s*([a-zA-Z0-9]+)',
        query_lower
    )
    if brand_pattern:
        brand_filter = brand_pattern.group(1).strip()
    else:
        # 2) Fallback: known brand appears directly in query
        for b in KNOWN_BRANDS:
            if b in query_lower:
                brand_filter = b
                break

    filtered = []
    for p in catalog:
        title = (p.get("title") or p.get("name") or "").lower()
        p_brand = (p.get("brand") or "").lower()
        category = (p.get("category") or p.get("categoryName") or "").lower()
        description = (p.get("description") or "").lower()

        # Strict brand filter — skip products that don't match the requested brand
        if brand_filter and brand_filter not in p_brand and brand_filter not in title:
            continue

        match = False
        for kw in keywords:
            if kw in title or kw in p_brand or kw in category or kw in description:
                match = True
                break

        if not match:
            continue

        try:
            price = float(p.get("sale_price") or p.get("price") or 0)
        except (ValueError, TypeError):
            price = 0.0
        if min_price and price < min_price:
            continue
        if max_price and price > max_price:
            continue

        filtered.append(p)

    if not filtered:
        filtered = catalog[:limit]

    scored = rank_products_by_score(filtered, {"favorite_category": query_lower, "avg_price_tolerance": 0})
    results = scored[:limit]

    for p in results:
        p.pop("_score", None)

    return {"success": True, "data": results}


@router.post("/cross-sell")
async def cross_sell(req: CrossSellRequest):
    suggestions = get_cross_sell_suggestions(req.category)
    return {"success": True, "data": suggestions}


@router.post("/similar")
async def similar_products(req: SimilarRequest):
    product = await _fetch_product(req.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    catalog = await _fetch_catalog(category=product.get("category") or product.get("categoryName"))
    results = get_similar_products(product, catalog, req.price_margin)
    return {"success": True, "data": results}


@router.post("/cart")
async def cart_suggestions(req: CartSuggestRequest):
    accessory_suggestions = get_cart_status_suggestions(req.items)
    combo = get_combo_suggestion(req.items)
    return {
        "success": True,
        "data": {
            "accessory_suggestions": accessory_suggestions,
            "combo": combo,
        },
    }


@router.post("/score")
async def score_products(req: ScoreRequest):
    ranked = rank_products_by_score(req.products, req.user_profile)
    for p in ranked:
        p.pop("_score", None)
    return {"success": True, "data": ranked}


# ── AI Parse: extract structured search params from natural language ──

PARSE_STOP_WORDS = {
    "mua", "tim", "tìm", "giá", "gia", "duoi", "dưới", "tren", "trên",
    "khoang", "khoảng", "chuyen", "chuyên", "chong", "chống", "nhe",
    "nhẹ", "dep", "đẹp", "xin", "tot", "tốt", "nen", "nên", "co",
    "có", "muon", "muốn", "một", "mot", "nhung", "nhưng", "cac",
    "các", "hay", "giup", "giúp", "tu", "tư", "van", "vấn", "em",
    "anh", "chi", "chị", "ban", "bạn", "toi", "tôi", "minh", "mình",
    "cho", "vao", "vào", "ra", "cua", "của", "khong", "không",
    "nay", "này", "do", "đó", "the", "thế", "thì", "biết", "biet",
    "cần", "can", "tư vấn", "tu van", "và", "hoặc", "hoac",
    "được", "duoc", "về", "ve", "với", "voi", "trong", "ngoai",
    "triệu", "trieu", "tr", "nghìn", "nghin", "k", "củ",
}

PARSE_CATEGORY_MAP = {
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


class AIParseRequest(BaseModel):
    query: str


PARSE_SYSTEM_PROMPT = """Bạn là bộ phân tích câu hỏi tìm kiếm sản phẩm. Phân tích câu hỏi của người dùng và trả về JSON có cấu trúc.

QUAN TRỌNG: Chỉ trả về JSON, không giải thích thêm.

Format JSON:
{
  "extracted_query": "từ khóa tìm kiếm chính (loại sản phẩm + model, không bao gồm giá, màu, tính năng)",
  "brand": "tên_hãng_sản_xuất_hoặc_null (VD: MSI, ASUS, Logitech, Dell, Samsung)",
  "category": "monitor|laptop|keyboard|mouse|headset|pc|storage|gpu|cooling|components|null",
  "min_price": số_nguyên_hoặc_null,
  "max_price": số_nguyên_hoặc_null,
  "color": "màu_tiếng_Việt_hoặc_null",
  "specs": ["tính_năng_1", "tính_năng_2"] hoặc []
}

Quy tắc:
- extracted_query: chỉ giữ loại sản phẩm + model (KHÔNG bao gồm brand, giá, màu)
- brand: tách riêng tên hãng sản xuất (MSI, ASUS, Dell, HP, Logitech, Razer, Samsung, Apple, Corsair, Kingston, Machenike, Acer, Lenovo, LG, AOC, BenQ, HyperX, SteelSeries, NZXT, GeForce, v.v.)
- category: map tiếng Việt sang English (màn hình→monitor, chuột→mouse, bàn phím→keyboard, ổ cứng/ssd→storage, vga/card đồ họa→gpu, tản nhiệt→cooling, tai nghe→headset, laptop→laptop, pc→pc)
- min_price/max_price: chuyển về VND (2 triệu→2000000, 500k→500000, dưới 2 triệu→max_price:2000000)
- color: trích màu (đen, trắng, hồng, xanh, đỏ, v.v.)
- specs: trích tính năng (bluetooth, wifi, wireless, rgb, gaming, usb-c, v.v.)

Ví dụ:
"chuột logitech màu đen dưới 2 triệu có bluetooth" → {"extracted_query":"chuột","brand":"Logitech","category":"mouse","min_price":null,"max_price":2000000,"color":"đen","specs":["bluetooth"]}
"màn hình AOC 27 inch 180Hz giá khoảng 5 triệu" → {"extracted_query":"27 inch","brand":"AOC","category":"monitor","min_price":null,"max_price":5000000,"color":null,"specs":["180hz"]}
"laptop gaming MSI giá dưới 20 triệu màu đen cấu hình mạnh" → {"extracted_query":"laptop gaming","brand":"MSI","category":"laptop","min_price":null,"max_price":20000000,"color":"đen","specs":["gaming"]}
"ổ cứng SSD 1TB Samsung dưới 500k" → {"extracted_query":"SSD 1TB","brand":"Samsung","category":"storage","min_price":null,"max_price":500000,"color":null,"specs":["1tb"]}"""


# Common brand names for rule-based detection
KNOWN_BRANDS = [
    "msi", "asus", "dell", "hp", "acer", "lenovo", "apple", "samsung",
    "logitech", "razer", "corsair", "kingston", "lg", "benq", "aoc",
    "hyperx", "steelseries", "nzxt", "machenike", "gearvn", "gigabyte",
    "cooler master", "thermaltake", "seasonic", "deepcool", "lian li",
    "western digital", "wd", "seagate", "crucial", "intel", "amd",
]


def _rule_based_parse(q: str) -> dict:
    """Fallback rule-based parser when LLM is unavailable."""
    import re
    q_lower = q.lower()

    words = q_lower.split()
    keywords = [w for w in words if w not in PARSE_STOP_WORDS and len(w) > 1]

    category = None
    for vi_key, en_cat in PARSE_CATEGORY_MAP.items():
        if vi_key in q_lower:
            category = en_cat
            cat_words = vi_key.split()
            keywords = [w for w in keywords if w not in cat_words]
            break

    # Detect brand
    brand = None
    for b in KNOWN_BRANDS:
        if b in q_lower:
            brand = b.upper() if len(b) <= 3 else b.title()
            # Remove brand words from keywords to avoid duplication
            for bw in b.split():
                keywords = [w for w in keywords if w != bw]
            break

    max_price = None
    min_price = None
    under_match = re.search(r'(?:dưới|duoi)\s*([\d.]+)\s*(k|nghìn|triệu|tr|củ|trieu)?', q, re.IGNORECASE)
    if under_match:
        val = float(under_match.group(1))
        unit = (under_match.group(2) or 'k').lower()
        if unit in ('triệu', 'tr', 'trieu'):
            val *= 1_000_000
        elif unit in ('k', 'nghìn'):
            val *= 1000
        max_price = val
    over_match = re.search(r'(?:trên|tren)\s*([\d.]+)\s*(k|nghìn|triệu|tr|củ|trieu)?', q, re.IGNORECASE)
    if over_match:
        val = float(over_match.group(1))
        unit = (over_match.group(2) or 'k').lower()
        if unit in ('triệu', 'tr', 'trieu'):
            val *= 1_000_000
        elif unit in ('k', 'nghìn'):
            val *= 1000
        min_price = val

    extracted_query = " ".join(keywords) if keywords else q

    return {
        "extracted_query": extracted_query,
        "brand": brand,
        "category": category,
        "min_price": min_price,
        "max_price": max_price,
        "color": None,
        "specs": [],
    }


@router.post("/ai-parse")
async def ai_parse(req: AIParseRequest):
    """Parse natural language Vietnamese query into structured search params using LLM."""
    import json as json_mod

    q = req.query

    # Try LLM-based parsing first
    try:
        from llm.client import get_llm_client
        import config.setting as config

        llm_client = get_llm_client(config.MODEL_TYPE)
        llm_response = llm_client.chat(
            user_message=f'Phân tích câu hỏi: "{q}"',
            system_prompt=PARSE_SYSTEM_PROMPT,
        )

        # Extract JSON from LLM response
        text = llm_response.strip()
        # Try to find JSON in the response
        start = text.find('{')
        end = text.rfind('}') + 1
        if start >= 0 and end > start:
            parsed = json_mod.loads(text[start:end])
            # Validate required fields
            result = {
                "extracted_query": parsed.get("extracted_query", q),
                "category": parsed.get("category"),
                "min_price": parsed.get("min_price"),
                "max_price": parsed.get("max_price"),
                "color": parsed.get("color"),
                "specs": parsed.get("specs", []),
            }
            # Convert string prices to numbers
            for key in ("min_price", "max_price"):
                val = result[key]
                if val is not None:
                    try:
                        result[key] = int(float(val))
                    except (ValueError, TypeError):
                        result[key] = None
            print(f"[ai-parse] LLM parsed '{q}' -> {result}")
            return result
    except Exception as e:
        print(f"[ai-parse] LLM parsing failed, using rules: {e}")

    # Fallback to rule-based
    result = _rule_based_parse(q)
    print(f"[ai-parse] Rule-based parsed '{q}' -> {result}")
    return result
