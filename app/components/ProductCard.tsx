"use client";

import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

      {/* Discount Badge */}
      <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
        30% OFF
      </div>

      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-60 object-cover"
      />

      <div className="p-5">

        <h2 className="text-2xl font-bold">
          {product.name}
        </h2>

        <p className="text-gray-500 mt-2">
          {product.description}
        </p>

        <div className="mt-3 flex items-center gap-2">

          <span className="text-yellow-500">
            ⭐⭐⭐⭐⭐
          </span>

          <span className="text-gray-500">
            (4.8)
          </span>

        </div>

        <div className="mt-4 flex items-center gap-3">

          <span className="text-3xl font-bold text-blue-600">
            ₹{product.price}
          </span>

          <span className="line-through text-gray-400">
            ₹{Math.round(product.price * 1.3)}
          </span>

        </div>

        <p className="text-green-600 font-semibold mt-3">
          🚚 Free Delivery
        </p>

        <p className="text-green-700 font-semibold">
          📦 In Stock
        </p>

        <button
          onClick={() => addToCart(product)}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          Add to Cart
        </button>

      </div>

    </div>
  );
}