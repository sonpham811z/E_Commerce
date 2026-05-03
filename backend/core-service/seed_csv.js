const fs = require('fs');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const DB_URL = " "
const CSV_FILE = "c:/cloud/E_Commerce/gearvn_products_transformed.csv";

function getCategory(title) {
    const t = title.toLowerCase();
    if (t.includes('laptop') || t.includes('macbook')) return 'Laptop';
    if (t.includes('màn hình')) return 'Màn hình';
    if (t.includes('bàn phím') || t.includes('keyboard')) return 'Bàn phím';
    if (t.includes('chuột') || t.includes('mouse')) return 'Chuột';
    if (t.includes('tai nghe') || t.includes('headphone')) return 'Tai nghe';
    if (t.includes('pc') || t.includes('máy tính bàn')) return 'PC Gaming';
    if (['vga', 'card màn hình', 'ssd', 'ram', 'cpu', 'mainboard', 'nguồn', 'case', 'tản nhiệt'].some(x => t.includes(x))) return 'Linh kiện';
    return 'Khác';
}

function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].trim().split(',');
    const result = [];
    
    // Very simple CSV parser, assuming well-formed or quoting might be an issue.
    // It's better to just use simple split with a regex for quotes
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        let row = [];
        let inQuote = false;
        let currentValue = '';
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                row.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        row.push(currentValue);
        
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j] || '';
        }
        result.push(obj);
    }
    return result;
}

async function run() {
    const client = new Client({ connectionString: DB_URL });
    await client.connect();

    console.log("Connected to DB");
    await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;");
    await client.query("DELETE FROM products;");
    
    const khacId = uuidv4();
    await client.query("INSERT INTO categories (id, name, slug, description) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING", [khacId, 'Khác', 'khac', 'Các sản phẩm khác']);
    
    const { rows: categories } = await client.query("SELECT name, id FROM categories");
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c.id; });

    const content = fs.readFileSync(CSV_FILE, 'utf-8');
    console.log("Loaded CSV content");
    const rows = parseCSV(content);
    console.log(`Parsed ${rows.length} rows`);

    let inserted = 0;
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const title = row.title;
        const brand = row.brand || 'Unknown';
        const image = row.image;
        const op = parseFloat(row.originalPrice) || 0;
        const sp = parseFloat(row.salePrice) || 0;
        const rt = parseFloat(row.rating) || 0;
        const rc = parseInt(row.reviewCount) || 0;
        
        const desc = row.description || '';
        const perf = row.performance || '';
        const ext = row.extends || '';
        
        let fullDesc = desc;
        if (perf) fullDesc += "\\nHiệu suất: " + perf;
        if (ext) fullDesc += "\\nMở rộng: " + ext;

        let thumbsStr = row.thumbnails || '';
        let imagesList = [image];
        if (thumbsStr.startsWith("['") && thumbsStr.endsWith("']")) {
             let clean = thumbsStr.slice(2, -2);
             imagesList = clean.split("', '");
        }

        const catName = getCategory(title);
        const catId = catMap[catName] || catMap['Khác'];

        const query = `
            INSERT INTO products (id, title, description, category, category_id, brand, specs, image, images, price, original_price, sale_price, stock, rating, review_count, is_active, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `;
        
        await client.query(query, [
            uuidv4(), title, fullDesc, catName, catId, brand, '{}', image, JSON.stringify(imagesList), sp, op, sp, 100, rt, rc, true, rt >= 4.0
        ]);
        
        inserted++;
        if (inserted % 500 === 0) console.log(`Inserted ${inserted}`);
    }

    console.log(`Successfully inserted ${inserted} products.`);
    await client.end();
}

run().catch(console.error);
