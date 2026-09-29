"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      console.log("DATA =", data);
      console.log("ERROR =", error);

      if (error) {
        setErrorMessage(
          "Products load nahi ho rahe hain. Please try again."
        );
        setLoading(false);
        return;
      }

      setProducts((data as Product[]) || []);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100">

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

      {/* Products */}
      <section
        id="products"
        className="max-w-7xl mx-auto p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Products
            </h2>

            <p className="text-gray-500 mt-2">
              Discover premium products at the best prices.
            </p>
          </div>

          <p className="text-gray-500 font-medium">
            {filteredProducts.length} Products Available
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-600 text-lg">
              Loading products...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-red-600 font-semibold">
              {errorMessage}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-600 text-lg">
              No products found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}