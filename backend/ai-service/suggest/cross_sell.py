def get_cross_sell_suggestions(product_category: str) -> list[str]:
    cross_sell_matrix = {
        "phone_case": ["screen_protector", "charger", "cable"],
        "smartphone": ["phone_case", "screen_protector", "charger", "earbuds"],
        "laptop": ["mouse", "keyboard", "laptop_stand", "bag"],
        "earbuds": ["protective_case", "charging_cable"]
    }
    
    return cross_sell_matrix.get(product_category, [])
