import csv
import json
import uuid
import psycopg2
import ast

DB_URL = "postgresql://neondb_owner:npg_0YspaXZPKi3H@ep-mute-sky-aowugm87-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
CSV_FILE = r"c:\cloud\E_Commerce\gearvn_products_transformed.csv"

def get_category(title):
    t = title.lower()
    if 'laptop' in t or 'macbook' in t:
        return 'Laptop'
    elif 'màn hình' in t:
        return 'Màn hình'
    elif 'bàn phím' in t or 'keyboard' in t:
        return 'Bàn phím'
    elif 'chuột' in t or 'mouse' in t:
        return 'Chuột'
    elif 'tai nghe' in t or 'headphone' in t:
        return 'Tai nghe'
    elif 'pc' in t or 'máy tính bàn' in t:
        return 'PC Gaming'
    elif any(x in t for x in ['vga', 'card màn hình', 'ssd', 'ram', 'cpu', 'mainboard', 'nguồn', 'case', 'tản nhiệt']):
        return 'Linh kiện'
    else:
        return 'Khác'

def run():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    print("Adding review_count if not exists...")
    cur.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;")
    
    print("Deleting old products...")
    cur.execute("DELETE FROM products;")

    # Ensure "Khác" category exists
    cur.execute("INSERT INTO categories (id, name, slug, description) VALUES (%s, %s, %s, %s) ON CONFLICT (slug) DO NOTHING", 
                (str(uuid.uuid4()), 'Khác', 'khac', 'Các sản phẩm khác'))
    
    cur.execute("SELECT name, id FROM categories")
    cat_map = {row[0]: row[1] for row in cur.fetchall()}

    products = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parse row
            title = row.get('title', '')
            brand = row.get('brand', 'Unknown')
            image = row.get('image', '')
            try:
                op = float(row.get('originalPrice', 0) or 0)
            except:
                op = 0
            try:
                sp = float(row.get('salePrice', 0) or 0)
            except:
                sp = 0
            try:
                rt = float(row.get('rating', 0) or 0)
            except:
                rt = 0
            try:
                rc = int(float(row.get('reviewCount', 0) or 0))
            except:
                rc = 0
                
            desc = row.get('description', '')
            perf = row.get('performance', '')
            ext = row.get('extends', '')
            
            full_desc = desc
            if perf:
                full_desc += "\nHiệu suất: " + perf
            if ext:
                full_desc += "\nMở rộng: " + ext

            # Try parsing thumbnails
            thumbs_str = row.get('thumbnails', '')
            try:
                # it's a string looking like ['url']
                images_list = ast.literal_eval(thumbs_str)
                if not isinstance(images_list, list):
                    images_list = [image]
            except:
                images_list = [image] if image else []
                
            cat_name = get_category(title)
            cat_id = cat_map.get(cat_name)
            
            products.append((
                str(uuid.uuid4()), # id
                title,
                full_desc,
                cat_name,
                cat_id,
                brand,
                '{}', # specs
                image,
                json.dumps(images_list),
                sp, # price
                op, # original_price
                sp, # sale_price
                100, # stock
                rt, # rating
                rc, # review_count
                True, # is_active
                rt >= 4.0 # is_featured
            ))

    print(f"Read {len(products)} products from CSV. Inserting...")
    
    insert_query = """
    INSERT INTO products (id, title, description, category, category_id, brand, specs, image, images, price, original_price, sale_price, stock, rating, review_count, is_active, is_featured)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    # insert in chunks
    chunk_size = 500
    for i in range(0, len(products), chunk_size):
        chunk = products[i:i+chunk_size]
        cur.executemany(insert_query, chunk)
        conn.commit()
        print(f"Inserted {i + len(chunk)} / {len(products)}")
        
    cur.close()
    conn.close()
    print("Done!")

if __name__ == '__main__':
    run()
