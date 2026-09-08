"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock?: number;
  compare_at_price?: number;
  rating?: number;
  review_count?: number;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  const hasDiscount =
    typeof product.compare_at_price === "number" &&
    product.compare_at_price > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const rating =
    typeof product.rating === "number" ? product.rating : null;

  const reviewCount =
    typeof product.review_count === "number"
      ? product.review_count
      : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart(product);
  };

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl duration-300 hover:-translate-y-2 border border-gray-100">

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
            {discountPercentage}% OFF
          </span>
        </div>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
            Out of Stock
          </span>
        </div>
      )}

      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-72 bg-gray-100 cursor-pointer overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition duration-500 hover:scale-105 ${
              isOutOfStock ? "opacity-60 grayscale" : ""
            }`}
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">

        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h2 className="text-2xl font-bold hover:text-blue-600 cursor-pointer transition line-clamp-1">
            {product.name}
          </h2>
        </Link>

        {/* Description */}
        <p className="text-gray-500 mt-2 line-clamp-2 min-h-[48px]">
          {product.description}
        </p>

        {/* Rating */}
        {rating !== null ? (
          <div className="flex items-center gap-1 mt-3">
            <span className="text-yellow-500 text-lg">
              {"★".repeat(Math.round(rating))}
            </span>

            <span className="text-gray-500 text-sm ml-1">
              {rating.toFixed(1)}
              {reviewCount > 0 && ` (${reviewCount})`}
            </span>
          </div>
        ) : (
          <div className="mt-3 text-gray-400 text-sm">
            No reviews yet
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <span className="text-3xl font-bold text-blue-600">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="line-through text-gray-400 text-lg">
              ₹{product.compare_at_price!.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-4">
          {isOutOfStock ? (
            <p className="text-red-600 font-semibold">
              📦 Currently unavailable
            </p>
          ) : stock <= 5 ? (
            <p className="text-orange-600 font-semibold">
              ⚡ Only {stock} left
            </p>
          ) : (
            <p className="text-green-600 font-semibold">
              ✓ In Stock
            </p>
          )}
        </div>

        {/* Delivery Information */}
        <p className="text-gray-600 text-sm mt-2">
          🚚 Delivery available
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full mt-5 py-3 rounded-xl font-semibold transition ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

      </div>
    </div>
  );
}