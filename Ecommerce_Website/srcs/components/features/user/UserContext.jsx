import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { coreApi } from "@/components/services/api";
import { toast } from "react-hot-toast";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { user } = useAuth();
  const [userInfo,           setUserInfo]           = useState(null);
  const [userId,             setUserId]             = useState(null);
  const [cartItems,          setCartItems]          = useState([]);
  const [recentlyAddedItems, setRecentlyAddedItems] = useState([]);
  const [cartCount,          setCartCount]          = useState(0);
  const [isCartLoading,      setIsCartLoading]      = useState(false);
  const [orderCount,         setOrderCount]         = useState({ active: 0, completed: 0, cancelled: 0 });
  const [isOrdersLoading,    setIsOrdersLoading]    = useState(false);

  // ── Sync state when auth user changes ──────────────────────
  useEffect(() => {
    if (user) {
      // gender and dob are not stored in the backend — persist locally per user
      const extra = JSON.parse(localStorage.getItem(`userExtra_${user.id}`) || '{}');
      setUserInfo({
        fullName: user.full_name || "",
        phone:    user.phone     || "",
        email:    user.email     || "",
        gender:   extra.gender   || "",
        dob:      extra.dob      || { day: "", month: "", year: "" },
      });
      setUserId(user.id);
      fetchCartItems(user.id);
      fetchOrderCounts(user.id);
    } else {
      setUserInfo(null);
      setUserId(null);
      setCartItems([]);
      setCartCount(0);
      setOrderCount({ active: 0, completed: 0, cancelled: 0 });
    }
  }, [user]);

  // ── Get user ID ─────────────────────────────────────────────
  const getUserId = useCallback(async () => userId, [userId]);

  // ── Order counts ────────────────────────────────────────────
  const fetchOrderCounts = useCallback(async (uid) => {
    if (!uid) return;
    setIsOrdersLoading(true);
    try {
      const { data } = await coreApi.get('/orders/mine', { params: { limit: 500 } });
      const orders = data.data?.orders || [];
      setOrderCount({
        active:    orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      });
    } catch {
      setOrderCount({ active: 0, completed: 0, cancelled: 0 });
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // ── Cart: localStorage only ──────────────────────────────────
  const fetchCartItems = useCallback(async (_uid) => {
    setIsCartLoading(true);
    try {
      const local = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(local);
      setCartCount(local.reduce((s, i) => s + (i.quantity || 1), 0));
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  // ── Add to cart (localStorage) ───────────────────────────────
  const addToCart = useCallback(async (product, quantity = 1, showToast = true) => {
    if (!product) return false;
    try {
      setCartItems(prev => {
        const idx = prev.findIndex(i => String(i.id) === String(product.id));
        const updated = idx >= 0
          ? prev.map((i, n) => n === idx ? { ...i, quantity: (i.quantity || 1) + quantity } : i)
          : [...prev, { ...product, quantity }];
        localStorage.setItem('cart', JSON.stringify(updated));
        setCartCount(updated.reduce((s, i) => s + (i.quantity || 1), 0));
        return updated;
      });
      setRecentlyAddedItems(prev => {
        const updated = [product, ...prev.filter(i => i.id !== product.id)].slice(0, 5);
        localStorage.setItem('recentlyAddedItems', JSON.stringify(updated));
        return updated;
      });
      if (showToast) {
        toast.success(`Đã thêm ${quantity} ${product.title || 'sản phẩm'} vào giỏ hàng!`, { icon: '🛒', duration: 3000 });
      }
      return true;
    } catch (err) {
      console.error("addToCart error:", err);
      if (showToast) toast.error("Không thể thêm sản phẩm vào giỏ hàng.");
      return false;
    }
  }, []);

  // ── Remove from cart (localStorage) ─────────────────────────
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setCartItems(prev => {
        const updated = prev.filter(i => String(i.id) !== String(itemId));
        localStorage.setItem('cart', JSON.stringify(updated));
        setCartCount(updated.reduce((s, i) => s + (i.quantity || 1), 0));
        return updated;
      });
      toast.success("Sản phẩm đã được xóa khỏi giỏ hàng!");
      return true;
    } catch (err) {
      console.error("removeFromCart error:", err);
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng.");
      return false;
    }
  }, []);

  // ── Update quantity (localStorage) ──────────────────────────
  const updateCartItemQuantity = useCallback(async (itemId, newQuantity) => {
    try {
      setCartItems(prev => {
        const updated = prev.map(i => String(i.id) === String(itemId) ? { ...i, quantity: newQuantity } : i);
        localStorage.setItem('cart', JSON.stringify(updated));
        setCartCount(updated.reduce((s, i) => s + (i.quantity || 1), 0));
        return updated;
      });
      return true;
    } catch (err) {
      console.error("updateCartItemQuantity error:", err);
      toast.error("Không thể cập nhật số lượng.");
      return false;
    }
  }, []);

  // ── Clear cart (localStorage) ────────────────────────────────
  const clearCart = useCallback(async () => {
    setCartItems([]);
    setCartCount(0);
    localStorage.removeItem('cart');
    return true;
  }, []);

  // ── Create order via core-service ────────────────────────────
  const createOrder = useCallback(async (orderData) => {
    try {
      const uid = await getUserId();
      if (!uid) {
        toast.error("Vui lòng đăng nhập để đặt hàng!");
        return false;
      }

      const items = (Array.isArray(orderData.product_info) ? orderData.product_info : [orderData.product_info])
        .filter(Boolean)
        .map(item => ({
          product_id: String(item.id),
          quantity:   item.quantity || 1,
        }));

      const payload = {
        user_id:         uid,
        customer_name:   orderData.customer_name,
        phone:           orderData.phone,
        address:         orderData.address,
        items,
        shipping_method: orderData.shipping_method || 'standard',
        payment_method:  orderData.payment_method  || 'cod',
        discount_code:   orderData.discount_code   || null,
      };

      const { data } = await coreApi.post('/orders', payload);
      const order = data.data;

      await clearCart();
      await fetchOrderCounts(uid);
      toast.success("Đặt hàng thành công!");
      return order.id;
    } catch (err) {
      console.error("createOrder error:", err);
      toast.error(err.response?.data?.error || "Không thể tạo đơn hàng. Vui lòng thử lại sau.");
      return false;
    }
  }, [getUserId, clearCart, fetchOrderCounts]);

  return (
    <UserContext.Provider value={{
      userInfo,
      setUserInfo,
      getUserId,
      userId,
      cartItems,
      cartCount,
      isCartLoading,
      recentlyAddedItems,
      orderCount,
      isOrdersLoading,
      fetchOrderCounts,
      createOrder,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
