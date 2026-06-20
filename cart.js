// =============================================================
//  cart.js
//  useCart — custom hook that owns all cart state and logic.
//  Returns cart array, totals, and action methods.
//  Depends on: constants.js (React globals, fmt)
// =============================================================
import React, { useState, useEffect, useRef } from "react";

function useCart(showToast) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(product.name + " added to cart!");
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return {
    cart,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
  };
}

// Expose as a global for legacy non-module usage
window.useCart = useCart;
