import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center">
          
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Order Successful!
          </h1>

          {/* Message */}
          <p className="mt-4 text-gray-600 text-base sm:text-lg">
            🎉 Thank you for your order!
          </p>

          <p className="mt-2 text-gray-500">
            Your payment has been successfully verified and your order has
            been placed.
          </p>

          {/* Payment Status */}
          <div className="mt-8 rounded-2xl bg-green-50 border border-green-200 p-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className="font-semibold text-green-600">
                Paid
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold text-gray-900">
                Razorpay
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue Shopping
            </Link>

            <Link
              href="/cart"
              className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View Cart
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-8 text-sm text-gray-400">
            Thank you for shopping with NovaCart.
          </p>
        </div>
      </div>
    </main>
  );
}