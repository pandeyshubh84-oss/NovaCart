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
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  const oldPrice = Math.round(product.price * 1.3);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl duration-300 hover:-translate-y-2">

      {/* Discount Badge */}
      <div className="absolute mt-3 ml-3 z-10">
        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
          30% OFF
        </span>
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-72 bg-gray-100 cursor-pointer">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">

        <Link href={`/product/${product.id}`}>
          <h2 className="text-2xl font-bold hover:text-blue-600 cursor-pointer">
            {product.name}
          </h2>
        </Link>

        <p className="text-gray-500 mt-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-3 text-yellow-500 text-lg">
          ⭐ ⭐ ⭐ ⭐ ⭐
          <span className="text-gray-500 text-sm ml-2">
            (4.8)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-4xl font-bold text-blue-600">
            ₹{product.price}
          </span>

          <span className="line-through text-gray-400 text-xl">
            ₹{oldPrice}
          </span>
        </div>

        {/* Delivery */}
        <p className="text-green-600 font-semibold mt-4">
          🚚 Free Delivery
        </p>

        {/* Stock */}
        <p className="text-green-700 font-semibold">
          📦 In Stock
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product)}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
        >
          Add to Cart
        </button>

      </div>
    </div>
  );
}