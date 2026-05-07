def get_similar_products(target_product: dict, catalog: list[dict], price_margin: float = 0.2) -> list[dict]:
    target_category = target_product.get("category")
    target_price = target_product.get("price", 0)
    target_brand = target_product.get("brand")
    target_id = target_product.get("id")
    
    similar_list = []
    
    for product in catalog:
        if product.get("id") == target_id:
            continue
            
        if product.get("category") != target_category:
            continue
            
        p_price = product.get("price", 0)
        min_price = target_price * (1.0 - price_margin)
        max_price = target_price * (1.0 + price_margin)
        
        if not (min_price <= p_price <= max_price):
            continue
            
        is_same_brand = 1 if product.get("brand") == target_brand else 0
        
        similar_list.append({
            "product": product,
            "score": is_same_brand
        })
        
    similar_list.sort(key=lambda x: x["score"], reverse=True)
    
    return [item["product"] for item in similar_list]
