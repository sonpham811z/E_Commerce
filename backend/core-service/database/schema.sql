-- Core Service Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image       TEXT,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug      ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent    ON categories (parent_id);

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  brand           VARCHAR(100), -- Đã thêm cột brand
  category        VARCHAR(100),
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand           VARCHAR(100),
  specs           JSONB DEFAULT '{}',
  image           TEXT,
  images          JSONB DEFAULT '[]',
  specs           JSONB,        -- Đã thêm cột specs
  price           NUMERIC(15, 0) NOT NULL CHECK (price >= 0),
  original_price  NUMERIC(15, 0),
  sale_price      NUMERIC(15, 0),
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating          NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category    ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_title_fts   ON products USING gin(to_tsvector('english', title));

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID,
  customer_name   VARCHAR(100) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  address         JSONB NOT NULL,
  shipping_method VARCHAR(50) NOT NULL DEFAULT 'standard',
  payment_method  VARCHAR(50) NOT NULL,
  product_price   NUMERIC(15, 0) NOT NULL DEFAULT 0,
  shipping_fee    NUMERIC(15, 0) NOT NULL DEFAULT 0,
  discount        NUMERIC(15, 0) NOT NULL DEFAULT 0,
  discount_code   VARCHAR(50),
  total           NUMERIC(15, 0) NOT NULL,
  status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','shipped','delivered','cancelled','deleted')),
  payment_status  VARCHAR(30) NOT NULL DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id     ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment     ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_date        ON orders (order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone       ON orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_deleted     ON orders (deleted_at) WHERE deleted_at IS NULL;

-- ─── Order Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID,
  product_name    VARCHAR(255) NOT NULL,
  product_image   TEXT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  price           NUMERIC(15, 0) NOT NULL CHECK (price >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product  ON order_items (product_id);

-- ─── Discount Codes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discount_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50) UNIQUE NOT NULL,
  discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value  NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC(15, 0),
  max_uses        INTEGER,
  used_count      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  starts_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_code ON discount_codes (code);

-- ─── Triggers ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Seed Categories ─────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description) VALUES
  ('Laptops', 'laptops', 'Notebook computers'),
  ('Desktops', 'desktops', 'Desktop PCs'),
  ('Monitors', 'monitors', 'Display monitors'),
  ('Keyboards', 'keyboards', 'Mechanical and membrane keyboards'),
  ('Mice', 'mice', 'Gaming and office mice'),
  ('Headsets', 'headsets', 'Audio headsets'),
  ('Graphics Cards', 'graphics-cards', 'GPUs'),
  ('RAM', 'ram', 'Memory modules'),
  ('Storage', 'storage', 'SSDs and HDDs'),
  ('CPUs', 'cpus', 'Processors')
ON CONFLICT (slug) DO NOTHING;