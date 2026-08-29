import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div>

          <span className="inline-block bg-yellow-400 text-black font-bold px-4 py-2 rounded-full mb-6">
            🔥 MEGA SALE • LIMITED TIME
          </span>

          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
            Welcome to
            <br />
            <span className="text-yellow-300">
              NovaCart
            </span>
          </h1>

          <p className="mt-6 text-lg text-blue-100 leading-8">
            Shop premium fashion, shoes, electronics, gadgets,
            accessories and much more at the best prices.
            Fast delivery, secure checkout and trusted quality—
            all in one place.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">

            <Link
              href="#products"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition"
            >
              🛍️ Shop Now
            </Link>

            <Link
              href="/cart"
              className="border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-700 transition font-bold"
            >
              🛒 View Cart
            </Link>

          </div>

          <div className="grid grid-cols-3 gap-6 mt-12">

            <div>
              <h3 className="text-3xl font-bold">10K+</h3>
              <p className="text-blue-100">
                Happy Customers
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">500+</h3>
              <p className="text-blue-100">
                Premium Products
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">24/7</h3>
              <p className="text-blue-100">
                Customer Support
              </p>
            </div>

          </div>

        </div>

        {/* Right Image */}

        <div className="flex justify-center">

          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900"
            alt="NovaCart Shopping"
            className="rounded-3xl shadow-2xl w-full max-w-lg hover:scale-105 transition duration-500"
          />

        </div>

      </div>
    </section>
  );
}