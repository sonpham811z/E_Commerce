const request = require('supertest');

// Mock database before requiring app
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

process.env.JWT_SECRET = 'test_secret_key_that_is_long_enough_32chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_that_is_long_enough';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const app = require('../src/app');
const { query } = require('../src/config/database');

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgMmrY4X4wFNFoOGBqRpOq',
  full_name: 'Test User',
  phone: '0901234567',
  role: 'user',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 with service info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.service).toBe('auth-service');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user and returns tokens', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })          // findByEmail → no existing
        .mockResolvedValueOnce({ rows: [mockUser] })  // create user
        .mockResolvedValueOnce({ rows: [] });          // storeRefreshToken

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        full_name: 'Test User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    it('returns 409 if email already exists', async () => {
      query.mockResolvedValueOnce({ rows: [mockUser] }); // findByEmail → found

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        full_name: 'Test User',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('returns 422 for invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'not-an-email',
        password: 'Password123!',
        full_name: 'Test User',
      });
      expect(res.status).toBe(422);
    });

    it('returns 422 for short password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: '123',
        full_name: 'Test User',
      });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns tokens on valid credentials', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockUser] }) // findByEmail
        .mockResolvedValueOnce({ rows: [] });         // storeRefreshToken

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Admin@123456',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('returns 401 on wrong password', async () => {
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('returns 401 when user not found', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'notfound@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('always returns 200 (prevents email enumeration)', async () => {
      query.mockResolvedValueOnce({ rows: [] }); // user not found

      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'noone@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
