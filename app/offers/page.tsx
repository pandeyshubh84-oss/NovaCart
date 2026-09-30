"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import OfferBanner from "../components/OfferBanner";
import ProductCard from "../components/ProductCard";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock?: number;
  compare_at_price?: number;
  rating?: number;
  review_count?: number;
};

function discountOf(p: Product) {
  if (!p.compare_at_price || p.compare_at_price <= p.price) return 0;
  return (p.compare_at_price - p.price) / p.compare_at_price;
}

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .not("compare_at_price", "is", null);

    if (error) {
      console.error("Offers error:", error.message);
      setErrorMessage("Offers could not be loaded. Please try again.");
      setLoading(false);
      return;
    }

    const offers = ((data as Product[]) || [])
      .filter((p) => discountOf(p) > 0)
      .sort((a, b) => discountOf(b) - discountOf(a)); // biggest discount first

    setProducts(offers);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return (
    <main className="min-h-screen bg-gray-100">
      <OfferBanner />
      <Navbar />

      <section className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            🔥 Today&apos;s Offers
          </h1>
          <p className="text-gray-500 mt-2">
            Products with the biggest price drops, shown first.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
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
              onClick={fetchOffers}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-600 text-lg">
              No offers running right now. Please check back soon.
            </p>
            <a
              href="/"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Browse all products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}