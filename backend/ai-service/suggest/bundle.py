def get_combo_suggestion(cart_items: list[dict]) -> dict:
    categories_in_cart = [item.get("category") for item in cart_items]
    
    if "smartphone" in categories_in_cart:
        return {
            "combo_id": "bundle_phone_protection",
            "title": "Combo tiết kiệm 15%",
            "description": "Bảo vệ toàn diện điện thoại của bạn",
            "items_to_add": ["phone_case", "screen_protector", "charger"],
            "discount_percentage": 15,
            "type": "add_all"
        }
        
    if "laptop" in categories_in_cart:
        return {
            "combo_id": "bundle_desk_setup",
            "title": "Combo làm việc hiệu quả",
            "description": "Gear xịn cho máy xịn, giảm giá 10%",
            "items_to_add": ["mouse", "mouse_pad", "laptop_stand"],
            "discount_percentage": 10,
            "type": "add_all"
        }
        
    return {}
