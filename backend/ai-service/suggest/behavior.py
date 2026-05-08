def get_recently_viewed(user_id: str, db_adapter) -> list[dict]:
    recent_items = db_adapter.get_recent_views(user_id, limit=5)
    return recent_items

def get_personalized_filter(user_profile: dict, catalog: list[dict]) -> list[dict]:
    hated_brands = user_profile.get("hated_brands", [])
    preferred_os = user_profile.get("preferred_os")
    
    filtered_catalog = []
    
    for p in catalog:
        if p.get("brand") in hated_brands:
            continue
            
        if preferred_os == "Android" and p.get("brand") == "Apple":
            continue
            
        filtered_catalog.append(p)
        
    return filtered_catalog
