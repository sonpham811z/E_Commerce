const { Client } = require('pg');
const c = new Client({ connectionString: '' });
c.connect()
  .then(() => c.query("SELECT COUNT(*) FROM products WHERE is_active = true"))
  .then(r => { console.log('Total active products:', r.rows[0].count); return c.query("SELECT COUNT(*) FROM products WHERE category ILIKE 'laptop'"); })
  .then(r => { console.log('Laptop products:', r.rows[0].count); return c.query("SELECT COUNT(*) FROM products WHERE is_featured = true"); })
  .then(r => { console.log('Featured products:', r.rows[0].count); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
