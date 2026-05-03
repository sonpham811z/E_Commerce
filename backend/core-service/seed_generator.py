import json
import uuid
import os

products_file = r'c:\cloud\E_Commerce\products.json'
output_file = r'c:\cloud\E_Commerce\backend\core-service\database\seed_products.sql'

with open(products_file, 'r', encoding='utf-8') as f:
    products = json.load(f)

# Extract unique categories from products
categories = {}
for p in products:
    cat_name = p.get('category')
    if cat_name and cat_name not in categories:
        categories[cat_name] = {
            'id': str(uuid.uuid4()),
            'slug': cat_name.lower().replace(' ', '-').replace('à','a').replace('á','a').replace('ẹ','e').replace('ì','i').replace('í','i').replace('ò','o').replace('ó','o'),
            'name': cat_name
        }

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("-- ALTER TABLE to add brand and specs in case they are missing\n")
    out.write("DO $$\n")
    out.write("BEGIN\n")
    out.write("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand') THEN\n")
    out.write("        ALTER TABLE products ADD COLUMN brand VARCHAR(100);\n")
    out.write("    END IF;\n")
    out.write("    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='specs') THEN\n")
    out.write("        ALTER TABLE products ADD COLUMN specs JSONB DEFAULT '{}';\n")
    out.write("    END IF;\n")
    out.write("END $$;\n\n")

    out.write("-- Insert Categories\n")
    for cat in categories.values():
        out.write(f"INSERT INTO categories (id, name, slug, description) VALUES ('{cat['id']}', '{cat['name']}', '{cat['slug']}', '{cat['name']}') ON CONFLICT (slug) DO NOTHING;\n")

    out.write("\n-- Insert Products\n")
    for p in products:
        p_id = str(uuid.uuid4())
        title = p.get('name', '').replace("'", "''")
        description = p.get('description', '').replace("'", "''")
        category = p.get('category', '').replace("'", "''")
        cat_id = categories.get(category, {}).get('id', 'NULL')
        if cat_id != 'NULL':
            cat_id = f"'{cat_id}'"
        brand = p.get('brand', '').replace("'", "''")
        
        specs = p.get('specs', {})
        specs_json = json.dumps(specs).replace("'", "''")
        
        image = p.get('image_url', '').replace("'", "''")
        images_json = json.dumps([image]).replace("'", "''")
        
        price = p.get('price', 0)
        original_price = int(price * 1.2)  # dummy original price
        sale_price = price
        stock = 100
        rating = 5.0
        
        out.write(f"INSERT INTO products (id, title, description, category, category_id, brand, specs, image, images, price, original_price, sale_price, stock, rating, is_active, is_featured) ")
        out.write(f"VALUES ('{p_id}', '{title}', '{description}', '{category}', {cat_id}, '{brand}', '{specs_json}', '{image}', '{images_json}', {price}, {original_price}, {sale_price}, {stock}, {rating}, true, true);\n")
        
print("Successfully generated seed_products.sql")
