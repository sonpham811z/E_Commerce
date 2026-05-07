const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3002;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Rewrite /api/v1/* → /api/* so frontend aiApi (base=/api/v1) matches /api/ proxy routes
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/v1/')) {
    req.url = req.url.replace('/api/v1/', '/api/');
  }
  next();
});

let pythonProcess = null;

function startPythonService() {
  const chatbotDir = path.join(__dirname, '..', 'chatbot');
  const parentDir = path.join(__dirname, '..');

  console.log(`[ai-service] Starting Python FastAPI from: ${chatbotDir}`);

  const env = { ...process.env, PYTHONPATH: parentDir };

  pythonProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: chatbotDir,
    env,
    shell: true,
    stdio: 'pipe',
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[python] ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[python] ${data.toString().trim()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`[python] Process exited with code ${code}`);
  });

  pythonProcess.on('error', (err) => {
    console.error(`[python] Failed to start: ${err.message}`);
  });
}

startPythonService();

async function waitForPythonApi(maxRetries = 30, intervalMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(`${PYTHON_API_URL}/health`, { timeout: 3000 });
      console.log(`[ai-service] Python API is ready at ${PYTHON_API_URL}`);
      return true;
    } catch {
      console.log(`[ai-service] Waiting for Python API... (${i + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  console.error('[ai-service] Python API did not become ready in time');
  return false;
}

app.get('/health', async (_req, res) => {
  try {
    const pyRes = await axios.get(`${PYTHON_API_URL}/health`, { timeout: 5000 });
    res.json({
      status: 'healthy',
      node_service: 'running',
      python_service: pyRes.data,
    });
  } catch {
    res.json({
      status: 'degraded',
      node_service: 'running',
      python_service: 'unreachable',
    });
  }
});

app.get('/test', async (_req, res) => {
  try {
    const pyRes = await axios.get(`${PYTHON_API_URL}/health`, { timeout: 5000 });
    res.json({ status: 'ok', python: pyRes.data });
  } catch {
    res.status(503).json({ status: 'error', message: 'Python service unreachable' });
  }
});

app.post('/direct-query', async (req, res) => {
  try {
    const query = req.body?.query || req.query?.query || '';

    if (!query.trim()) {
      return res.status(400).json({
        response: [{ type: 'text', message: 'Vui lòng nhập câu hỏi của bạn.' }],
      });
    }

    console.log(`[ai-service] direct-query: query="${query}"`);

    const chatPayload = {
      message: query.trim(),
      conversation_history: [],
      use_rag: true,
    };

    const pyRes = await axios.post(`${PYTHON_API_URL}/api/chat`, chatPayload, {
      timeout: 120000,
      headers: { 'Content-Type': 'application/json' },
    });

    const chatData = pyRes.data;
    const answer = chatData.answer || 'Xin lỗi, em không tìm thấy thông tin phù hợp.';
    const products = chatData.products || null;

    const responseItems = [{ type: 'text', message: answer }];

    if (products && Array.isArray(products) && products.length > 0) {
      products.forEach((p) => {
        responseItems.push({
          type: 'product',
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          original_price: p.original_price,
          sale_price: p.sale_price,
          category: p.category,
          image: p.image,
          rating: p.rating,
          link: p.deep_link || p.link || `/product/${p.id}`,
        });
      });
    }

    res.json({ response: responseItems });
  } catch (error) {
    console.error('[ai-service] direct-query error:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        response: [{
          type: 'text',
          message: `Lỗi từ máy chủ AI: ${error.response.status}`,
        }],
        detail: error.response.data,
      });
    }

    res.status(500).json({
      response: [{
        type: 'text',
        message: 'Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.',
      }],
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const pyRes = await axios.post(`${PYTHON_API_URL}/api/chat`, req.body, {
      timeout: 120000,
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/chat proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Python service unreachable' });
  }
});

app.post('/api/search/ai-parse', async (req, res) => {
  try {
    const pyRes = await axios.post(`${PYTHON_API_URL}/api/suggest/ai-parse`, req.body, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/search/ai-parse proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ extracted_query: req.body?.query || '' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const pyRes = await axios.get(`${PYTHON_API_URL}/api/products`, {
      params: req.query,
      timeout: 10000,
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/products proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Python service unreachable' });
  }
});

app.get('/api/suggest/search', async (req, res) => {
  try {
    const pyRes = await axios.get(`${PYTHON_API_URL}/api/suggest/search`, {
      params: req.query,
      timeout: 15000,
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/suggest/search proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, data: [] });
  }
});

app.post('/api/suggest/cross-sell', async (req, res) => {
  try {
    const pyRes = await axios.post(`${PYTHON_API_URL}/api/suggest/cross-sell`, req.body, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/suggest/cross-sell proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, data: [] });
  }
});

app.post('/api/suggest/similar', async (req, res) => {
  try {
    const pyRes = await axios.post(`${PYTHON_API_URL}/api/suggest/similar`, req.body, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/suggest/similar proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, data: [] });
  }
});

app.post('/api/suggest/cart', async (req, res) => {
  try {
    const pyRes = await axios.post(`${PYTHON_API_URL}/api/suggest/cart`, req.body, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/suggest/cart proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, data: {} });
  }
});

app.post('/api/suggest/score', async (req, res) => {
  try {
    const pyRes = await axios.post(`${PYTHON_API_URL}/api/suggest/score`, req.body, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(pyRes.data);
  } catch (error) {
    console.error('[ai-service] /api/suggest/score proxy error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, data: [] });
  }
});

app.get('/', (_req, res) => {
  res.json({
    service: 'ai-service',
    version: '1.0.0',
    status: 'running',
    python_api: PYTHON_API_URL,
  });
});

app.listen(PORT, () => {
  console.log(`[ai-service] Node.js server running on http://localhost:${PORT}`);
  console.log(`[ai-service] Proxying to Python API at ${PYTHON_API_URL}`);
  console.log(`[ai-service] Waiting for Python API to become ready...`);
  waitForPythonApi().then((ready) => {
    if (ready) {
      console.log(`[ai-service] Python API is ready - all endpoints active`);
    } else {
      console.warn(`[ai-service] Python API did not become ready - some endpoints will return errors`);
    }
  });
});
