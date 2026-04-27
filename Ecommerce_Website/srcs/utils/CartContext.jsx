import { createContext, useContext } from 'react';
import { useUser } from '../components/features/user/UserContext';

/**
 * CartContext delegates entirely to UserContext, which handles both
 * localStorage and Supabase persistence. UserProvider is above CartProvider
 * in the tree (see main.jsx), so useUser() is always available here.
 *
 * Adapter layer:
 *  - Normalises product shape  (name→title, price→salePrice)
 *  - Supports optional onSuccess callback used by ProductCard
 *  - Exposes the same field names as the old useCartRaw API
 *    so existing consumers need no changes
 */

const CartContext = createContext();

/** Normalise the varied product shapes callers pass in */
function normaliseProduct(product) {
  return {
    ...product,
    title:         product.title         || product.name  || '',
    salePrice:     product.salePrice     || product.price || 0,
    originalPrice: product.originalPrice || product.original_price || 0,
  };
}

export function CartProvider({ children }) {
  const {
    cartItems,
    isCartLoading,
    addToCart:              userAddToCart,
    removeFromCart:         userRemoveFromCart,
    updateCartItemQuantity: userUpdateQty,
    clearCart:              userClearCart,
  } = useUser();

  /**
   * addToCart(product, onSuccess?)
   * Matches the old useCartRaw signature expected by ProductCard / ProductInfo.
   */
  const addToCart = (product, onSuccess) => {
    const normalised = normaliseProduct(product);
    const qty        = normalised.quantity || 1;

    userAddToCart(normalised, qty, /* showToast= */ false).then((ok) => {
      if (ok && onSuccess) {
        // Provide the same result shape ProductCard's callback expects
        const existing = cartItems.find(i => String(i.id) === String(normalised.id));
        onSuccess({
          action: existing ? 'update' : 'add',
          updatedProduct: { ...normalised, quantity: (existing?.quantity || 0) + qty },
          cart: cartItems,
        });
      }
    });
  };

  /**
   * removeFromCart(productId, onSuccess?)
   */
  const removeFromCart = (productId, onSuccess) => {
    const removed = cartItems.find(i => String(i.id) === String(productId));
    userRemoveFromCart(productId).then((ok) => {
      if (ok && onSuccess && removed) {
        onSuccess({ removedProduct: removed, cart: cartItems.filter(i => String(i.id) !== String(productId)) });
      }
    });
  };

  /**
   * updateQuantity(productId, quantity, onSuccess?)
   */
  const updateQuantity = (productId, quantity, onSuccess) => {
    if (quantity < 1) return;
    userUpdateQty(productId, quantity).then((ok) => {
      if (ok && onSuccess) {
        const updated = cartItems.map(i => String(i.id) === String(productId) ? { ...i, quantity } : i);
        onSuccess({ cart: updated, updatedProduct: updated.find(i => String(i.id) === String(productId)) });
      }
    });
  };

  /**
   * clearCart(onSuccess?)
   */
  const clearCart = (onSuccess) => {
    userClearCart().then((ok) => {
      if (ok && onSuccess) onSuccess({ cart: [] });
    });
  };

  return (
    <CartContext.Provider value={{
      cart:       cartItems,
      isLoading:  isCartLoading,
      isMutating: false,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
