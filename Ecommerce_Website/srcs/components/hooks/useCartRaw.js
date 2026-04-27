import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../features/notify/NotificationContext';

export function useCart() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const { addToCart: addNotification } = useNotifications();

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setCart(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Add product to cart with notification handling
  const addToCart = useCallback(
    (product, onSuccess) => {
      setIsMutating(true);

      setTimeout(() => {
        try {
          let result = null;

          setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);

            if (existing) {
              const updated = prev.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + (product.quantity || 1),
                    }
                  : item
              );

              result = {
                cart: updated,
                updatedProduct: {
                  ...existing,
                  quantity: existing.quantity + (product.quantity || 1),
                },
                action: 'update',
              };

              return updated;
            } else {
              const newProduct = {
                ...product,
                quantity: product.quantity || 1,
              };
              const updated = [...prev, newProduct];

              result = {
                cart: updated,
                updatedProduct: newProduct,
                action: 'add',
              };

              return updated;
            }
          });

          // Add notification using the notification context - but only once per action
          addNotification({
            name: product.name || 'Sản phẩm',
          });

          setTimeout(() => {
            if (onSuccess && result) {
              onSuccess(result);
            }
            setIsMutating(false);
          }, 50);
        } catch (error) {
          console.error('Error adding to cart:', error);
          toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
          setIsMutating(false);
        }
      }, 300);
    },
    [addNotification]
  );

  // ✅ ĐÃ SỬA: Remove product from cart
  const removeFromCart = useCallback(
    (productId, onSuccess) => {
      setIsMutating(true);

      const productToRemove = cart.find((item) => item.id === productId);

      setTimeout(() => {
        try {
          let updatedCart = [];

          setCart((prev) => {
            updatedCart = prev.filter((item) => item.id !== productId);
            return updatedCart;
          });

          setTimeout(() => {
            if (onSuccess && productToRemove) {
              onSuccess({
                cart: updatedCart,
                removedProduct: productToRemove,
              });
            }
            setIsMutating(false);
          }, 50);
        } catch (error) {
          console.error('Error removing from cart:', error);
          toast.error('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng');
          setIsMutating(false);
        }
      }, 300);
    },
    [cart]
  );

  // Update product quantity
  const updateQuantity = useCallback((productId, quantity, onSuccess) => {
    if (quantity < 1) return;
    setIsMutating(true);

    setTimeout(() => {
      try {
        setCart((prev) => {
          const updated = prev.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          );

          const updatedProduct = updated.find((item) => item.id === productId);

          if (onSuccess && updatedProduct) {
            onSuccess({
              cart: updated,
              updatedProduct,
            });
          }

          return updated;
        });
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        toast.error('Có lỗi xảy ra khi cập nhật số lượng');
      } finally {
        setIsMutating(false);
      }
    }, 300);
  }, []);

  // Clear cart
  const clearCart = useCallback((onSuccess) => {
    setIsMutating(true);

    setTimeout(() => {
      try {
        setCart([]);

        if (onSuccess) {
          onSuccess({ cart: [] });
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Có lỗi xảy ra khi xóa giỏ hàng');
      } finally {
        setIsMutating(false);
      }
    }, 300);
  }, []);

  return {
    cart,
    isLoading,
    isMutating,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
