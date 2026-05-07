def calculate_product_score(product: dict, user_profile: dict) -> float:
    W1_CATEGORY = 0.3
    W2_PRICE = 0.3
    W3_BRAND = 0.2
    W4_COLOR = 0.2
    
    preferred_category = user_profile.get("favorite_category")
    preferred_brand = user_profile.get("favorite_brand")
    preferred_color = user_profile.get("favorite_color")
    target_price = user_profile.get("avg_price_tolerance", 0)
    
    category_score = 1.0 if product.get("category") == preferred_category else 0.0
    
    brand_score = 1.0 if product.get("brand") == preferred_brand else 0.0
    
    color_score = 1.0 if product.get("color") == preferred_color else 0.0
    
    product_price = product.get("price", 0)
    price_score = 0.0
    if target_price > 0:
        diff_ratio = abs(target_price - product_price) / target_price
        price_score = max(0.0, 1.0 - diff_ratio)
        
    total_score = (W1_CATEGORY * category_score) + (W2_PRICE * price_score) + (W3_BRAND * brand_score) + (W4_COLOR * color_score)
    
    return total_score

def rank_products_by_score(products: list[dict], user_profile: dict) -> list[dict]:
    for p in products:
        p["_score"] = calculate_product_score(p, user_profile)
        
    return sorted(products, key=lambda x: x["_score"], reverse=True)
