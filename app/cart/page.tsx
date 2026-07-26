"use client";

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

      <h1 className="text-4xl font-bold mb-8">
        🛒 Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow">
          <h2 className="text-2xl font-semibold">
            Your cart is empty
          </h2>

          <p className="text-gray-500 mt-3">
            Add some products to continue shopping.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">

            {cart.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-5 flex items-center gap-5"
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-28 rounded-lg object-cover"
                />

                <div className="flex-1">

                  <h2 className="text-2xl font-bold">
                    {item.name}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    {item.description}
                  </p>

                  <p className="text-blue-600 text-xl font-bold mt-3">
                    ₹{item.price}
                  </p>

                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

          <div className="bg-white mt-10 rounded-xl shadow p-8">

            <h2 className="text-3xl font-bold">
              Total : ₹{totalPrice}
            </h2>

            <button
              onClick={clearCart}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
            >
              Clear Cart
            </button>

          </div>
        </>
      )}

    </main>
  );
}