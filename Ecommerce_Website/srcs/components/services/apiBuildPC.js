import { supabase } from './supabase';

export async function getProductsByCategory(category) {
  const { data, error } = await supabase
    .from('product')
    .select('id, title, image, sale_price, original_price, rating, review_count, description, brand, category')
    .eq('category', category)
    .eq('is_active', true)
    .order('sale_price', { ascending: true });

  if (error) {
    console.error(`Error fetching products (category=${category}):`, error.message);
    return [];
  }

  return (data || []).map(item => ({
    id:            item.id,
    title:         item.title,
    image:         item.image || '',
    salePrice:     item.sale_price,
    originalPrice: item.original_price,
    rating:        item.rating,
    reviewCount:   item.review_count,
    description:   item.description || '',
    category:      item.category,
    brand:         item.brand || '',
  }));
}

export const calculateTotalPrice = (components) =>
  components.reduce((total, c) => total + (c.salePrice || c.price || 0), 0);
