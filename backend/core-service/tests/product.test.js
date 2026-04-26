const request = require('supertest');

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(),
}));

jest.mock('../src/middleware/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'user-123', email: 'admin@example.com', role: 'admin' };
    next();
  },
  optionalAuth: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

const app = require('../src/app');
const { query } = require('../src/config/database');

const mockProduct = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Test Laptop',
  description: 'A great laptop',
  category: 'laptops',
  price: 15000000,
  original_price: 18000000,
  sale_price: 14500000,
  stock: 10,
  rating: 4.5,
  is_active: true,
  is_featured: false,
  created_at: new Date().toISOString(),
};

describe('Core Service - Products', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('core-service');
    });
  });

  describe('GET /api/v1/products', () => {
    it('returns paginated product list', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockProduct] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.total).toBe(1);
    });

    it('filters by category', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockProduct] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app).get('/api/v1/products?category=laptops');
      expect(res.status).toBe(200);
    });

    it('supports search query', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockProduct] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app).get('/api/v1/products?search=laptop');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('returns a product by ID', async () => {
      query.mockResolvedValueOnce({ rows: [mockProduct] });

      const res = await request(app).get(`/api/v1/products/${mockProduct.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(mockProduct.id);
    });

    it('returns 404 for unknown product', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/api/v1/products/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/products', () => {
    it('creates a product (admin)', async () => {
      query.mockResolvedValueOnce({ rows: [mockProduct] });

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Test Laptop',
          category: 'laptops',
          price: 15000000,
          stock: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('updates a product (admin)', async () => {
      const updated = { ...mockProduct, price: 16000000 };
      query.mockResolvedValueOnce({ rows: [updated] });

      const res = await request(app)
        .patch(`/api/v1/products/${mockProduct.id}`)
        .set('Authorization', 'Bearer admin-token')
        .send({ price: 16000000 });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(16000000);
    });

    it('returns 404 for unknown product', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .patch('/api/v1/products/nonexistent')
        .set('Authorization', 'Bearer admin-token')
        .send({ price: 100 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('deletes a product (admin)', async () => {
      query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .delete(`/api/v1/products/${mockProduct.id}`)
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Core Service - Categories', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/v1/categories', () => {
    it('returns category list', async () => {
      query.mockResolvedValueOnce({
        rows: [{ id: 'cat-1', name: 'Laptops', slug: 'laptops', is_active: true }],
      });

      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
