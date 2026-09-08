"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, image, category, stock"
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("PRODUCT LOAD ERROR:", error);
        setProduct(null);
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error("PRODUCT ERROR:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!product || product.stock <= 0 || addingToCart) {
      return;
    }

    try {
      setAddingToCart(true);

      addToCart(product);

      alert("🛒 Product added to cart!");
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
      alert("Unable to add product to cart.");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleBuyNow() {
    if (!product || product.stock <= 0) {
      return;
    }

    try {
      setAddingToCart(true);

      addToCart(product);

      router.push("/cart");
    } catch (error) {
      console.error("BUY NOW ERROR:", error);
      alert("Unable to continue.");
    } finally {
      setAddingToCart(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">
            🛍️
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Loading Product...
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4">
            😕
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h2>

          <p className="text-gray-500 mt-3">
            This product may have been removed or is
            no longer available.
          </p>

          <Link
            href="/"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const stock = Number(product.stock) || 0;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 font-semibold hover:underline mb-6"
        >
          ← Back to Home
        </Link>

        {/* Product Container */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl shadow-xl p-5 md:p-8">

          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div>
            <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden border">
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover ${
                  isOutOfStock
                    ? "opacity-60 grayscale"
                    : ""
                }`}
              />

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="flex flex-col justify-center">

            {/* Category */}
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-5">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-gray-600 mt-5 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="mt-8">
              <span className="text-4xl md:text-5xl font-bold text-blue-600">
                ₹
                {Number(product.price || 0).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            {/* Stock */}
            <div className="mt-5">

              {isOutOfStock ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-bold">
                    ❌ Currently Out of Stock
                  </p>

                  <p className="text-red-600 text-sm mt-1">
                    This product is currently unavailable.
                  </p>
                </div>
              ) : isLowStock ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-orange-700 font-bold">
                    ⚡ Only {stock} left in stock
                  </p>

                  <p className="text-orange-600 text-sm mt-1">
                    Order soon before it sells out.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-bold">
                    ✓ In Stock
                  </p>

                  <p className="text-green-600 text-sm mt-1">
                    {stock} units currently available.
                  </p>
                </div>
              )}

            </div>

            {/* Delivery */}
            <div className="mt-5 bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-800">
                🚚 Delivery available
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Delivery details will be confirmed during
                checkout.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`flex-1 py-4 rounded-xl text-lg font-bold transition ${
                  isOutOfStock || addingToCart
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : addingToCart
                  ? "Adding..."
                  : "🛒 Add to Cart"}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock || addingToCart}
                className={`flex-1 py-4 rounded-xl text-lg font-bold transition ${
                  isOutOfStock || addingToCart
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isOutOfStock
                  ? "Unavailable"
                  : addingToCart
                  ? "Please wait..."
                  : "⚡ Buy Now"}
              </button>

            </div>

            {/* Trust Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl">
                  🔒
                </div>

                <p className="font-semibold text-sm mt-2">
                  Secure Checkout
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl">
                  💳
                </div>

                <p className="font-semibold text-sm mt-2">
                  Safe Payments
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl">
                  📦
                </div>

                <p className="font-semibold text-sm mt-2">
                  Easy Ordering
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}