"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
const { data, error } = await supabase
  .from("products")
  .select("*");

console.log("DATA =", data);
console.log("ERROR =", error);

if (data) {
  setProducts(data);
}
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}

      <nav className="bg-white shadow-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <div>
          <h1 className="text-3xl font-extrabold text-blue-600">
            🛍️ NovaCart
          </h1>
          <p className="text-xs text-gray-500">
            Premium Online Shopping
          </p>
        </div>

        {/* Search */}

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-xl px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Navigation */}

        <div className="flex items-center gap-6 font-medium">

          <button className="hover:text-blue-600 transition">
            Home
          </button>

<Link
  href="/categories"
  className="hover:text-blue-600 transition"
>
  Categories
</Link>

          <Link
            href="/cart"
            className="hover:text-blue-600 transition"
          >
            🛒 Cart
          </Link>

          <button className="hover:text-blue-600 transition">
            Login
          </button>

        </div>

      </nav>

      {/* Hero */}

      <Hero />

      {/* Products */}

      <section id="products" className="p-8">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-4xl font-bold">
            Featured Products
          </h2>

          <p className="text-gray-500">
            {products.length} Products Available
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {products
            .filter((product) =>
              product.name
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

        </div>

      </section>

    </main>
  );
}