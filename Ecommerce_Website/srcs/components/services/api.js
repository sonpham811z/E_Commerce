import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001';
const AI_URL   = import.meta.env.VITE_AI_SERVICE_URL   || 'http://localhost:3002';
const CORE_URL = import.meta.env.VITE_CORE_SERVICE_URL || 'http://localhost:3003';

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');
          const { data } = await axios.post(`${AUTH_URL}/api/v1/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return instance(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const authApi = createInstance(`${AUTH_URL}/api/v1`);
export const aiApi   = createInstance(`${AI_URL}/api`);
export const coreApi = createInstance(`${CORE_URL}/api/v1`);

// Legacy wrappers — keep these so old imports of fetchProducts/placeOrder still work
export async function fetchProducts() {
  try {
    const { data } = await coreApi.get('/products');
    return data.data?.products || [];
  } catch { return []; }
}

export async function placeOrder(orderData) {
  try {
    const { data } = await coreApi.post('/orders', orderData);
    return data.data;
  } catch { return null; }
}
