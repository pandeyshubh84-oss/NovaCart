"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock?: number;
};

export type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];

  addToCart: (product: Product) => void;

  increaseQuantity: (id: string) => void;

  decreaseQuantity: (id: string) => void;

  removeFromCart: (id: string) => void;

  clearCart: () => void;

  totalItems: number;

  totalPrice: number;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const CART_STORAGE_KEY = "globalmart-cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  /* =====================================================
     LOAD CART FROM LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCart) {
        return;
      }

      const parsedCart = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return;
      }

      /*
       * Convert old cart items into the new
       * quantity-based format.
       *
       * This prevents existing saved carts
       * from breaking after the update.
       */

      const normalizedCart: CartItem[] =
        parsedCart
          .filter(
            (product) =>
              product &&
              typeof product.id === "string"
          )
          .map((product) => ({
            ...product,
            quantity:
              Number(product.quantity) > 0
                ? Math.floor(Number(product.quantity))
                : 1,
          }));

      /*
       * Remove duplicate product IDs.
       * If an old cart somehow contains duplicates,
       * keep the first one.
       */

      const uniqueProducts: CartItem[] = [];

      for (const product of normalizedCart) {
        const alreadyExists = uniqueProducts.some(
          (item) => item.id === product.id
        );

        if (!alreadyExists) {
          uniqueProducts.push(product);
        }
      }

      setCart(uniqueProducts);
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error
      );

      localStorage.removeItem(
        CART_STORAGE_KEY
      );
    }
  }, []);

  /* =====================================================
     SAVE CART TO LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Unable to save cart:",
        error
      );
    }
  }, [cart]);

  /* =====================================================
     ADD PRODUCT TO CART
  ===================================================== */

  function addToCart(product: Product) {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id
      );

      const stock =
        typeof product.stock === "number"
          ? product.stock
          : null;

      /* -----------------------------------------------
         PRODUCT ALREADY EXISTS
      ------------------------------------------------ */

      if (existingItem) {
        /*
         * Don't increase quantity beyond stock.
         */

        if (
          stock !== null &&
          existingItem.quantity >= stock
        ) {
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                stock: product.stock,
                price: product.price,
              }
            : item
        );
      }

      /* -----------------------------------------------
         PRODUCT DOES NOT EXIST
      ------------------------------------------------ */

      if (stock !== null && stock <= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  /* =====================================================
     INCREASE QUANTITY
  ===================================================== */

  function increaseQuantity(id: string) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const stock =
          typeof item.stock === "number"
            ? item.stock
            : null;

        /*
         * If stock is available, don't exceed it.
         */

        if (
          stock !== null &&
          item.quantity >= stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  }

  /* =====================================================
     DECREASE QUANTITY
  ===================================================== */

  function decreaseQuantity(id: string) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1,
          };
        })
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  /* =====================================================
     REMOVE PRODUCT
  ===================================================== */

  function removeFromCart(id: string) {
    setCart((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  }

  /* =====================================================
     CLEAR CART
  ===================================================== */

  function clearCart() {
    setCart([]);
  }

  /* =====================================================
     TOTAL ITEMS
  ===================================================== */

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  /* =====================================================
     TOTAL PRICE
  ===================================================== */

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        item.quantity,
    0
  );

  /* =====================================================
     PROVIDER
  ===================================================== */

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =======================================================
   USE CART
======================================================= */

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}