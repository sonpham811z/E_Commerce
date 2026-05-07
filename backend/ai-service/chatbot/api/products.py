"""
Product search API - connects to the .NET backend to search products
and return results with images and deep links for the mobile app.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os

router = APIRouter(prefix="/api/products", tags=["products"])

# Backend API base URL - same host, port 5058
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5058")


class ProductSearchRequest(BaseModel):
    query: str
    max_results: int = 6
    category: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None


class ProductResult(BaseModel):
    id: int
    name: str
    price: float
    original_price: Optional[float] = None
    discount: Optional[float] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    sold_quantity: Optional[int] = None
    deep_link: str  # e.g. /product/123


class ProductSearchResponse(BaseModel):
    products: List[ProductResult]
    total: int
    query: str


@router.post("/search", response_model=ProductSearchResponse)
async def search_products(request: ProductSearchRequest):
    """Search products from the .NET backend and return formatted results."""
    try:
        params = {
            "q": request.query,
            "pageSize": request.max_results,
        }
        if request.min_price:
            params["minPrice"] = request.min_price
        if request.max_price:
            params["maxPrice"] = request.max_price

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}/api/products", params=params)
            response.raise_for_status()

        data = response.json()

        # Handle wrapped response { success: true, data: { ... } }
        if isinstance(data, dict) and "data" in data and "success" in data:
            data = data["data"]

        items = []
        if isinstance(data, dict):
            items = data.get("data", data.get("items", []))
            total = data.get("total", len(items))
        elif isinstance(data, list):
            items = data
            total = len(items)
        else:
            items = []
            total = 0

        products = []
        for item in items[:request.max_results]:
            products.append(ProductResult(
                id=item.get("id", 0),
                name=item.get("name", ""),
                price=item.get("price", 0),
                original_price=item.get("originalPrice"),
                discount=item.get("discount"),
                image=item.get("image"),
                rating=item.get("rating"),
                sold_quantity=item.get("soldQuantity"),
                deep_link=f"/product/{item.get('id', 0)}"
            ))

        return ProductSearchResponse(
            products=products,
            total=total,
            query=request.query
        )

    except httpx.HTTPError as e:
        print(f"Backend product search error: {e}")
        return ProductSearchResponse(products=[], total=0, query=request.query)
    except Exception as e:
        print(f"Product search error: {e}")
        return ProductSearchResponse(products=[], total=0, query=request.query)


@router.get("/{product_id}")
async def get_product_detail(product_id: int):
    """Fetch a single product detail from the backend."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}/api/products/{product_id}")
            response.raise_for_status()

        data = response.json()
        if isinstance(data, dict) and "data" in data and "success" in data:
            data = data["data"]

        return data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Product not found: {e}")
