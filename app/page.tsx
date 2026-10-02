"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import OfferBanner from "./components/OfferBanner";
import Footer from "./components/Footer";

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
  { icon: "⚡", title: "Fast Delivery", text: "Quick shipping across India" },
  { icon: "🔒", title: "Secure Checkout", text: "Safe payments via Razorpay" },
  { icon: "🤝", title: "COD Available", text: "Pay cash at your doorstep" },
  { icon: "💎", title: "Premium Quality", text: "Handpicked luxury items" },
];

const CATEGORY_TILES = [
  { name: "Streetwear", icon: "👕", text: "Oversized graphic tees & hoodies" },
  { name: "Footwear", icon: "👟", text: "Aesthetic slides & hype sneakers" },
  { name: "Accessories", icon: "🕶️", text: "Y2K sunglasses, chains & charms" },
];

const normalize = (value?: string) => (value || "").trim().toLowerCase();

function GoldLine() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
  );
}

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
      const element = document.getElementById("products");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  }

  const filteredProducts = products
    .filter((product) =>
      (product.name || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategory === "All" ||
        normalize(product.category) === normalize(selectedCategory)
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f5f4] selection:bg-[#d4af37] selection:text-black">
      <OfferBanner />
      <Navbar />

      {/* Search */}
      <section className="bg-[#0a0a0a] px-4 py-4 border-b border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto flex justify-center">
          <input
            type="text"
            placeholder="Search streetwear, slides, accessories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black border border-[#d4af37]/30 text-zinc-100 rounded-full px-5 py-3 w-full max-w-xl text-sm placeholder-zinc-500 transition-all focus:outline-none focus:border-[#d4af37] focus:shadow-[0_0_18px_rgba(212,175,55,0.25)]"
          />
        </div>
      </section>

      <Hero />

      <GoldLine />

      {/* Trust Badges */}
      <section className="bg-[#0a0a0a] py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-3 bg-black border border-[#d4af37]/20 p-3 rounded-xl"
            >
              <span className="text-xl bg-[#d4af37]/10 p-2 rounded-lg border border-[#d4af37]/30">
                {badge.icon}
              </span>
              <div>
                <p className="font-semibold text-[#f5d77a] text-xs md:text-sm">
                  {badge.title}
                </p>
                <p className="text-zinc-500 text-[10px] md:text-xs leading-tight">
                  {badge.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <GoldLine />

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-16">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="font-serif text-xl md:text-3xl tracking-[0.12em] text-[#f5d77a] uppercase">
              Shop by Category
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm mt-1">
              Curated drop cultures to redefine your aesthetic.
            </p>
          </div>
          <button
            onClick={() => chooseCategory("All")}
            className="text-[#d4af37] text-xs font-semibold hover:underline tracking-widest uppercase"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {CATEGORY_TILES.map((tile) => {
            const count = products.filter(
              (p) => normalize(p.category) === normalize(tile.name)
            ).length;
            const isActive =
              normalize(selectedCategory) === normalize(tile.name);

            return (
              <button
                key={tile.name}
                onClick={() => chooseCategory(tile.name)}
                className={
                  isActive
                    ? "text-left rounded-2xl p-3 md:p-5 border transition-all duration-300 flex flex-col justify-between group bg-black border-[#d4af37] shadow-[0_0_22px_rgba(212,175,55,0.3)]"
                    : "text-left rounded-2xl p-3 md:p-5 border transition-all duration-300 flex flex-col justify-between group bg-black border-[#d4af37]/20 hover:border-[#d4af37]/70"
                }
              >
                <div>
                  <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-xl md:text-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                    {tile.icon}
                  </span>
                  <h3 className="font-serif text-xs md:text-lg text-zinc-100 uppercase tracking-widest">
                    {tile.name}
                  </h3>
                  <p className="hidden md:block text-zinc-500 text-xs mt-1 font-light leading-relaxed">
                    {tile.text}
                  </p>
                </div>
                <p className="text-[#d4af37] text-[10px] md:text-xs font-medium mt-3 md:mt-4 tracking-widest uppercase">
                  {count > 0 ? `${count} live` : "Soon"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 border-b border-[#d4af37]/20 pb-6">
          <div>
            <h2 className="font-serif text-xl md:text-3xl tracking-[0.12em] text-[#f5d77a] uppercase">
              {selectedCategory === "All" ? "Featured Drops" : selectedCategory}
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm mt-1">
              High premium quality items. Exclusive at NovaCart.
            </p>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="text-[#d4af37] text-xs font-semibold mt-2 hover:underline tracking-widest"
              >
                ← SHOW ALL DROPS
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <p className="text-zinc-500 text-xs md:text-sm font-medium">
              {filteredProducts.length} Items Found
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-black border border-[#d4af37]/30 text-zinc-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
            >
              <option value="newest">Latest Release</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-xl text-center text-sm my-4">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="border border-[#d4af37]/10 rounded-2xl p-3 md:p-4 bg-black animate-pulse h-72"
              >
                <div className="bg-zinc-900 rounded-xl h-40 w-full mb-4"></div>
                <div className="h-4 bg-zinc-900 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-900 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-zinc-500 py-16 text-sm">
            No products found. Try another search or category.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}