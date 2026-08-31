"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch {
      // Silently fail — could show toast in future
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className="flex items-center justify-center h-12 w-full rounded-md bg-bg-primary-dark text-text-on-dark text-body font-medium hover:bg-bg-primary-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {added ? (
        <>
          <Check size={18} className="mr-2" />
          Added to Cart
        </>
      ) : loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Adding...
        </>
      ) : (
        <>
          <ShoppingBag size={18} className="mr-2" />
          {disabled ? "Out of Stock" : "Add to Cart"}
        </>
      )}
    </button>
  );
}
