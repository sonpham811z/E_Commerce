const request = require('supertest');

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(),
}));

jest.mock('../src/middleware/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'user-123', email: 'test@example.com', role: 'user' };
    next();
  },
  optionalAuth: (req, res, next) => {
    req.user = { id: 'user-123', email: 'test@example.com', role: 'user' };
    next();
  },
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('../src/services/chatService', () => ({
  sendMessage: jest.fn(),
  getHistory: jest.fn(),
  getUserSessions: jest.fn(),
  deleteSession: jest.fn(),
}));

const app = require('../src/app');
const chatService = require('../src/services/chatService');

describe('AI Service - Chat', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('ai-service');
    });
  });

  describe('POST /api/v1/chat/message', () => {
    it('returns AI reply', async () => {
      chatService.sendMessage.mockResolvedValue({
        session_id: 'session-abc',
        reply: 'Hello! How can I help you today?',
      });

      const res = await request(app)
        .post('/api/v1/chat/message')
        .send({ message: 'Hello', session_id: 'session-abc' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toBeDefined();
      expect(res.body.data.session_id).toBe('session-abc');
    });

    it('returns 422 for empty message', async () => {
      const res = await request(app)
        .post('/api/v1/chat/message')
        .send({ message: '' });

      expect(res.status).toBe(422);
    });

    it('returns 422 for missing message', async () => {
      const res = await request(app)
        .post('/api/v1/chat/message')
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/chat/sessions', () => {
    it('returns user sessions', async () => {
      chatService.getUserSessions.mockResolvedValue([
        { session_id: 'sess-1', content: 'Hello', created_at: new Date() },
      ]);

      const res = await request(app).get('/api/v1/chat/sessions');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/chat/sessions/:session_id', () => {
    it('returns chat history', async () => {
      chatService.getHistory.mockResolvedValue([
        { id: '1', role: 'user', content: 'Hi', created_at: new Date() },
        { id: '2', role: 'assistant', content: 'Hello!', created_at: new Date() },
      ]);

      const res = await request(app).get('/api/v1/chat/sessions/test-session-id');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('DELETE /api/v1/chat/sessions/:session_id', () => {
    it('deletes a session', async () => {
      chatService.deleteSession.mockResolvedValue();

      const res = await request(app).delete('/api/v1/chat/sessions/test-session-id');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
