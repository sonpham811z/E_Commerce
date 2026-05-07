from .cross_sell import get_cross_sell_suggestions
from .bundle import get_combo_suggestion
from .similar import get_similar_products
from .cart_suggest import get_cart_status_suggestions
from .scoring import rank_products_by_score
from .behavior import get_personalized_filter

class RuleEngine:
    def __init__(self, catalog: list[dict]):
        self.catalog = catalog
        
    def smart_upsell(self, viewing_product: dict) -> dict:
        target_category = viewing_product.get("category")
        target_price = viewing_product.get("price", 0)
        
        candidates = []
        for p in self.catalog:
            price = p.get("price", 0)
            if p.get("category") == target_category and target_price < price <= target_price * 1.5:
                candidates.append(p)
                
        if not candidates:
            return None
            
        candidates.sort(key=lambda x: x["price"])
        upsell_product = candidates[0]
        extra_fee = upsell_product["price"] - target_price
        
        return {
            "upsell_product": upsell_product,
            "message": f"Chỉ thêm {extra_fee}đ để nâng cấp lên bản xịn hơn ({upsell_product.get('name')})"
        }
        
    def recommend_for_cart(self, current_cart_items: list[dict]) -> dict:
        cart_cat_suggestions = get_cart_status_suggestions(current_cart_items)
        bundle_suggestion = get_combo_suggestion(current_cart_items)
        
        return {
            "cart_accessory_suggestions": cart_cat_suggestions,
            "combo_available": bundle_suggestion
        }
