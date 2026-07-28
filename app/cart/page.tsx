"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      {/* Heading */}
      <div className="flex items-center justify-between mb-8">

        <h1 className="text-4xl font-bold">
          🛒 Shopping Cart
        </h1>

        <Link
          href="/"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
        >
          Continue Shopping
        </Link>

      </div>

      {/* Empty Cart */}
      {cart.length === 0 ? (

        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">

          <h2 className="text-3xl font-bold">
            Your Cart is Empty
          </h2>

          <p className="text-gray-500 mt-3">
            Add some amazing products.
          </p>

          <Link
            href="/"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Shop Now
          </Link>

        </div>

      ) : (

        <>
          {/* Cart Items */}
          <div className="space-y-6">

            {cart.map((item, index) => (

              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between"
              >

                <div className="flex items-center gap-5">

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-28 h-28 rounded-xl object-cover"
                  />

                  <div>

                    <h2 className="text-2xl font-bold">
                      {item.name}
                    </h2>

                    <p className="text-gray-500 mt-2">
                      {item.description}
                    </p>

                    <p className="text-blue-600 text-2xl font-bold mt-3">
                      ₹{item.price}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-5 py-3 rounded-xl hover:bg-red-600"
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">

            <div className="flex justify-between text-3xl font-bold">

              <span>Total</span>

              <span className="text-blue-600">
                ₹{total}
              </span>

            </div>

            <Link
              href="/checkout"
              className="block w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-xl font-bold text-center transition"
            >
              Proceed to Checkout
            </Link>

          </div>

        </>
      )}

    </main>
  );
}