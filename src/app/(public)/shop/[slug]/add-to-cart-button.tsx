"use client";

import { useState, useCallback } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [pulse, setPulse] = useState(false);

  const handleAddToCart = useCallback(async () => {
    if (disabled || loading) return;
    setLoading(true);
    setPulse(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        setAdded(true);
        // Dispatch custom event so header can re-fetch cart count
        window.dispatchEvent(new Event("cart-updated"));
        setTimeout(() => setAdded(false), 2500);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
      setTimeout(() => setPulse(false), 350);
    }
  }, [productId, disabled, loading]);

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center h-12 w-full rounded-md text-body font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        added
          ? "bg-success text-white"
          : "bg-bg-primary-dark text-text-on-dark hover:bg-bg-primary-dark-elevated",
        pulse && "cart-pulse",
      )}
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
