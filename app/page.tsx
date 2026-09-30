"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import OfferBanner from "./components/OfferBanner";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
  compare_at_price?: number;
  rating?: number;
  review_count?: number;
};

type SortOption = "newest" | "price-low" | "price-high";

const TRUST_BADGES = [
  { icon: "🚚", title: "Fast Delivery", text: "Quick shipping across India" },
  { icon: "🔒", title: "Secure Payment", text: "Safe checkout with Razorpay" },
  { icon: "↩️", title: "Easy Support", text: "We are here to help you" },
  { icon: "✅", title: "Quality Products", text: "Carefully selected items" },
];

// Category names must match the "category" column in Supabase exactly
// (capital letters do not matter).
const CATEGORY_TILES = [
  { name: "Kurtas", icon: "👘", text: "Festive kurtas and sets" },
  { name: "Sarees", icon: "🥻", text: "Elegant sarees for every occasion" },
  { name: "Accessories", icon: "💍", text: "Jewellery, dupattas and more" },
];

const normalize = (value?: string) => (value || "").trim().toLowerCase();

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products error:", error.message);
      setErrorMessage("Products could not be loaded. Please try again.");
      setLoading(false);
      return;
    }

    setProducts((data as Product[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function chooseCategory(name: string) {
    setSelectedCategory(name);
    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategory === "All" ||
        normalize(product.category) === normalize(selectedCategory)
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0; // "newest": keep the order from the database
    });

  return (
    <main className="min-h-screen bg-gray-100">
       {/* Offer Banner */}
      <OfferBanner />

      {/* Navbar */}
      <Navbar />
      
      {/* Search Section */}
      <section className="bg-white px-6 py-5 border-b">
        <div className="max-w-7xl mx-auto flex justify-center">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-xl px-5 py-3 w-full max-w-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* Hero */}
      <Hero />

      {/* Trust Badges */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3">
              <span className="text-3xl">{badge.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  {badge.title}
                </p>
                <p className="text-gray-500 text-xs md:text-sm">
                  {badge.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <p className="text-gray-500 mt-2">
              Find the perfect festive look for you.
            </p>
          </div>
          <button
            onClick={() => chooseCategory("All")}
            className="text-blue-600 font-semibold hover:underline"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {CATEGORY_TILES.map((tile) => {
            const count = products.filter(
              (p) => normalize(p.category) === normalize(tile.name)
            ).length;
            const isActive = normalize(selectedCategory) === normalize(tile.name);

            return (
              <button
                key={tile.name}
                onClick={() => chooseCategory(tile.name)}
                className={`text-left rounded-2xl p-6 shadow-sm border-2 transition hover:shadow-md hover:-translate-y-1 ${
                  isActive
                    ? "bg-blue-50 border-blue-600"
                    : "bg-white border-transparent"
                }`}
              >
                <span className="text-4xl">{tile.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-3">
                  {tile.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{tile.text}</p>
                <p className="text-blue-600 text-sm font-semibold mt-3">
                  {count > 0 ? `${count} items` : "Coming soon"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {selectedCategory === "All" ? "Featured Products" : selectedCategory}
            </h2>
            <p className="text-gray-500 mt-2">
              Discover premium products at the best prices.
            </p>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="text-blue-600 text-sm font-semibold mt-2 hover:underline"
              >
                ← Show all products
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-gray-500 font-medium">
              {filteredProducts.length} Products
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
              >
                <div className="bg-gray-200 rounded-xl h-48 mb-4" />
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-3" />
                <div className="bg-gray-200 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-red-600 font-semibold mb-4">{errorMessage}</p>
            <button
              onClick={fetchProducts}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-600 text-lg">
              {search
                ? `No products found for "${search}".`
                : selectedCategory !== "All"
                ? `Products in ${selectedCategory} are coming soon.`
                : "New products are coming soon. Please check back later."}
            </p>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Show all products
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">NovaCart</h3>
            <p className="text-sm text-gray-400">
              Quality products, secure checkout and reliable delivery, all in
              one place.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-white">Home</a>
              </li>
              <li>
                <a href="/cart" className="hover:text-white">Cart</a>
              </li>
              <li>
                <a href="/my-orders" className="hover:text-white">My Orders</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Secure Shopping</h4>
            <p className="text-sm text-gray-400">
              Payments are processed securely through Razorpay.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} NovaCart. All rights reserved.
        </div>
      </footer>
    </main>
  );
}