import { supabase } from "./supabase";

export async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }
  return data;
}

export async function placeOrder(orderData) {
  const { data, error } = await supabase.from("orders").insert([orderData]);
  if (error) {
    console.error("Error placing order:", error.message);
    return null;
  }
  return data;
}
