import axios from 'axios';

const API_URL = 'https://api.example.com/products';

export const fetchProducts = async (category) => {
  try {
    const response = await axios.get(`${API_URL}?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};