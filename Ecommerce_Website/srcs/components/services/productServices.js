import { coreApi } from './api';

export async function fetchProducts() {
  try {
    const { data } = await coreApi.get('/products', { params: { limit: 100, sort: 'rating' } });
    return data.data?.products || [];
  } catch {
    return [];
  }
}

export async function placeOrder(orderData) {
  try {
    const { data } = await coreApi.post('/orders', orderData);
    return data.data;
  } catch {
    return null;
  }
}
