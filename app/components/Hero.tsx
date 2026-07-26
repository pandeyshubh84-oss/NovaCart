export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center justify-between">

        <div className="max-w-xl">
          <p className="text-yellow-300 text-lg font-semibold mb-2">
            🔥 Limited Time Offer
          </p>

          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Summer Sale <br />
            Up to <span className="text-yellow-300">70% OFF</span>
          </h1>

          <p className="text-lg text-blue-100 mb-8">
            Discover premium fashion, electronics and accessories at unbeatable prices.
          </p>

          <button className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition">
            Shop Now
          </button>
        </div>

        <div className="mt-10 md:mt-0">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"
            alt="Shopping"
            className="rounded-2xl shadow-2xl w-[450px]"
          />
        </div>

      </div>
    </section>
  );
}