const fs = require('fs');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const DB_URL = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'core_db'}`;
const CSV_FILE = process.env.CSV_FILE || "c:/cloud/E_Commerce/products.csv";

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
    const pool = new Pool({
        connectionString: DB_URL,
        ssl: DB_URL.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    console.log("Connecting to DB...");
    const client = await pool.connect();

    try {
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

        const BATCH_SIZE = 100;
        let inserted = 0;

        for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
            const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);
            await client.query('BEGIN');

            try {
                for (const row of batch) {
                    const title = row.title;
                    const brand = row.brand || 'Unknown';
                    const image = row.image;
                    const op = parseFloat(row.originalPrice) || 0;
                    const sp = parseFloat(row.salePrice) || 0;
                    const disc = parseFloat(row.discount) || 0;
                    const rt = parseFloat(row.rating) || 0;
                    const rc = parseInt(row.reviewCount) || 0;
                    const csvId = row.id || '';

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
                    const price = sp > 0 ? sp : op;

                    const specs = JSON.stringify({
                        discount_percent: Math.round(disc * 100),
                        performance: perf || undefined,
                        extends: ext || undefined,
                        detailImage: row.detailImage || undefined,
                        csv_id: csvId || undefined,
                    });

                    await client.query(`
                        INSERT INTO products (id, title, description, category, category_id, brand, specs, image, images, price, original_price, sale_price, stock, rating, review_count, is_active, is_featured)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                    `, [
                        uuidv4(), title, fullDesc, catName, catId, brand, specs, image, JSON.stringify(imagesList), price, op, sp, 100, rt, rc, true, rt >= 4.0
                    ]);

                    inserted++;
                }

                await client.query('COMMIT');
                console.log(`Inserted ${inserted}/${rows.length}`);
            } catch (batchErr) {
                await client.query('ROLLBACK');
                console.error(`Batch failed at row ${inserted}:`, batchErr.message);
            }
        }

        console.log(`Successfully inserted ${inserted} products.`);
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(console.error);
