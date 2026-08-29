"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    clearCart,
    totalPrice,
  } = useCart();

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            🛒 Shopping Cart
          </h1>

          <p className="text-gray-500 mt-2">
            {cart.length} Product(s) in your cart
          </p>
        </div>

        <Link
          href="/"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
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

          <p className="text-gray-500 mt-4">
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
          {/* Products */}

          <div className="space-y-6">

            {cart.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between"
              >

                <div className="flex items-center gap-5">

                  <Link href={`/product/${item.id}`}>

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 h-28 rounded-xl object-cover cursor-pointer"
                    />

                  </Link>

                  <div>

                    <Link href={`/product/${item.id}`}>
                      <h2 className="text-2xl font-bold hover:text-blue-600">
                        {item.name}
                      </h2>
                    </Link>

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
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition"
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

          {/* Summary */}

          <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">

            <div className="flex justify-between text-xl mb-4">

              <span>Total Items</span>

              <span>{cart.length}</span>

            </div>

            <div className="flex justify-between text-3xl font-bold">

              <span>Total Price</span>

              <span className="text-blue-600">
                ₹{totalPrice}
              </span>

            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">

              <button
                onClick={clearCart}
                className="bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition"
              >
                Clear Cart
              </button>

              <Link
                href="/checkout"
                className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-center font-bold transition"
              >
                Proceed to Checkout
              </Link>

            </div>

          </div>

        </>
      )}

    </main>
  );
}