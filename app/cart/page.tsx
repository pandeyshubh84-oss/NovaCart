"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    totalItems,
    totalPrice,
  } = useCart();

  const formattedTotal = Number(totalPrice || 0).toLocaleString(
    "en-IN"
  );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              🛒 Shopping Cart
            </h1>

            <p className="text-gray-500 mt-2">
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 md:p-16 text-center border border-gray-100">
            <div className="text-6xl mb-5">🛒</div>

            <h2 className="text-3xl font-bold text-gray-900">
              Your Cart is Empty
            </h2>

            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet.
            </p>

            <Link
              href="/"
              className="inline-flex mt-7 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-bold transition"
            >
              🛍️ Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* CART PRODUCTS */}
            <div className="lg:col-span-2 space-y-5">
              {cart.map((item) => {
                const itemPrice = Number(item.price || 0);
                const itemTotal = itemPrice * item.quantity;

                const stock =
                  typeof item.stock === "number"
                    ? item.stock
                    : null;

                const reachedStockLimit =
                  stock !== null &&
                  item.quantity >= stock;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-5"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">

                      {/* IMAGE */}
                      <Link
                        href={`/product/${item.id}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                          />
                        </div>
                      </Link>

                      {/* INFO */}
                      <div className="flex-1 min-w-0">

                        <Link href={`/product/${item.id}`}>
                          <h2 className="text-xl md:text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
                            {item.name}
                          </h2>
                        </Link>

                        <p className="text-gray-500 mt-2 line-clamp-2">
                          {item.description}
                        </p>

                        <p className="text-blue-600 text-xl font-bold mt-3">
                          ₹{itemPrice.toLocaleString("en-IN")}
                          <span className="text-gray-500 text-sm font-normal">
                            {" "} / item
                          </span>
                        </p>

                        {/* QUANTITY */}
                        <div className="flex flex-wrap items-center gap-4 mt-5">

                          <span className="font-semibold text-gray-700">
                            Quantity:
                          </span>

                          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(item.id)
                              }
                              className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-xl font-bold transition"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              −
                            </button>

                            <span className="w-12 text-center font-bold text-lg">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(item.id)
                              }
                              disabled={reachedStockLimit}
                              className={`w-11 h-11 text-xl font-bold transition ${
                                reachedStockLimit
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>

                          </div>

                        </div>

                        {/* STOCK MESSAGE */}
                        <div className="mt-3">
                          {stock !== null ? (
                            stock <= 0 ? (
                              <p className="text-red-600 text-sm font-semibold">
                                ❌ Out of stock
                              </p>
                            ) : reachedStockLimit ? (
                              <p className="text-orange-600 text-sm font-semibold">
                                ⚠️ Maximum available quantity reached
                              </p>
                            ) : stock <= 5 ? (
                              <p className="text-orange-600 text-sm font-semibold">
                                ⚡ Only {stock} available
                              </p>
                            ) : (
                              <p className="text-green-600 text-sm font-semibold">
                                ✓ In Stock
                              </p>
                            )
                          ) : (
                            <p className="text-green-600 text-sm font-semibold">
                              ✓ Available
                            </p>
                          )}
                        </div>

                        {/* ITEM TOTAL */}
                        <div className="mt-4">
                          <span className="text-gray-600">
                            Item Total:{" "}
                          </span>

                          <span className="font-bold text-gray-900">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold transition"
                        >
                          🗑️ Remove
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:sticky lg:top-6">

                <h2 className="text-2xl font-bold text-gray-900">
                  Order Summary
                </h2>

                <div className="border-t my-5" />

                <div className="flex justify-between text-gray-600 mb-4">
                  <span>Total Items</span>

                  <span className="font-semibold text-gray-900">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 mb-4">
                  <span>Products</span>

                  <span className="font-semibold text-gray-900">
                    {cart.length}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 mb-4">
                  <span>Subtotal</span>

                  <span className="font-semibold text-gray-900">
                    ₹{formattedTotal}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 mb-4">
                  <span>Delivery</span>

                  <span className="text-green-600 font-semibold">
                    Available
                  </span>
                </div>

                <div className="border-t my-5" />

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-3xl font-bold text-blue-600">
                    ₹{formattedTotal}
                  </span>
                </div>

                {/* CHECKOUT */}
                <Link
                  href="/checkout"
                  className="block w-full mt-7 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-center font-bold text-lg transition"
                >
                  🔒 Proceed to Checkout
                </Link>

                {/* CONTINUE */}
                <Link
                  href="/"
                  className="block w-full mt-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl text-center font-semibold transition"
                >
                  Continue Shopping
                </Link>

                {/* CLEAR */}
                <button
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to clear your entire cart?"
                    );

                    if (confirmed) {
                      clearCart();
                    }
                  }}
                  className="w-full mt-4 text-red-600 hover:text-red-700 font-semibold py-2 transition"
                >
                  Clear Cart
                </button>

                {/* TRUST */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800">
                    🔒 Secure Checkout
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Your order total is verified securely before payment.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}