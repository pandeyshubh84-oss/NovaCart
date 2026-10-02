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

const isVideo = (url: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(url);

export default function ProductCard({ product }: { product: Product }) {
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

  const rating = typeof product.rating === "number" ? product.rating : null;

  const reviewCount =
    typeof product.review_count === "number" ? product.review_count : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart(product);
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/70 hover:shadow-[0_0_28px_rgba(212,175,55,0.2)] duration-300 hover:-translate-y-1 flex flex-col">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-gradient-to-r from-[#d4af37] to-[#f5d77a] text-black text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-md shadow">
            {discountPercentage}% OFF
          </span>
        </div>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-zinc-800 text-zinc-200 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-md border border-zinc-700">
            Out of Stock
          </span>
        </div>
      )}

      {/* Product Image / Video */}
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-52 sm:h-72 bg-zinc-950 cursor-pointer overflow-hidden">
          {isVideo(product.image) ? (
            <video
              src={product.image}
              autoPlay
              muted
              loop
              playsInline
              className={`w-full h-full object-cover ${
                isOutOfStock ? "opacity-60 grayscale" : ""
              }`}
            />
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition duration-500 hover:scale-105 ${
                isOutOfStock ? "opacity-60 grayscale" : ""
              }`}
            />
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h2 className="font-serif text-sm sm:text-xl text-zinc-100 hover:text-[#d4af37] cursor-pointer transition line-clamp-1 tracking-wide">
            {product.name}
          </h2>
        </Link>

        {/* Description (mobile pe chhupa hua) */}
        <p className="hidden sm:block text-zinc-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>

        {/* Rating */}
        {rating !== null ? (
          <div className="flex items-center gap-1 mt-2 sm:mt-3">
            <span className="text-[#d4af37] text-sm sm:text-lg">
              {"★".repeat(Math.round(rating))}
            </span>

            <span className="text-zinc-500 text-xs sm:text-sm ml-1">
              {rating.toFixed(1)}
              {reviewCount > 0 && ` (${reviewCount})`}
            </span>
          </div>
        ) : (
          <div className="mt-2 sm:mt-3 text-zinc-600 text-xs sm:text-sm">
            No reviews yet
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 flex-wrap">
          <span className="font-serif text-xl sm:text-3xl font-bold text-[#f5d77a]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="line-through text-zinc-600 text-sm sm:text-lg">
              ₹{product.compare_at_price!.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-3">
          {isOutOfStock ? (
            <p className="text-red-400 font-semibold text-xs sm:text-sm">
              📦 Currently unavailable
            </p>
          ) : stock <= 5 ? (
            <p className="text-amber-400 font-semibold text-xs sm:text-sm">
              ⚡ Only {stock} left
            </p>
          ) : (
            <p className="text-emerald-400 font-semibold text-xs sm:text-sm">
              ✓ In Stock
            </p>
          )}
        </div>

        {/* Delivery Information */}
        <p className="text-zinc-500 text-xs sm:text-sm mt-1">
          🚚 Delivery available
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full mt-4 sm:mt-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-all ${
            isOutOfStock
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#d4af37] to-[#f5d77a] text-black hover:shadow-[0_0_18px_rgba(212,175,55,0.5)]"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}