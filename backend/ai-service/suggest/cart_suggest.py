def get_cart_status_suggestions(cart_items: list[dict]) -> list[str]:
    cart_categories = {item.get("category") for item in cart_items}
    suggestions = set()
    
    if "smartphone" in cart_categories:
        suggestions.update(["phone_case", "screen_protector", "extended_warranty"])
        
    if "earbuds" in cart_categories or "headphones" in cart_categories:
        suggestions.update(["headphone_stand", "cleaning_kit", "protective_case"])
        
    if "laptop" in cart_categories:
        suggestions.update(["bag", "mouse", "office_365"])
        
    final_suggestions = suggestions - cart_categories
    
    return list(final_suggestions)
