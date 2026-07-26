"use client";

import { useEffect, useState } from "react";
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

      if (!error && data) {
        setProducts(data);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}

      <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

        <h1 className="text-3xl font-bold text-blue-600">
          GlobalMart
        </h1>

<input
  type="text"
  placeholder="Search products..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="border rounded-lg px-4 py-2 w-80"
/>

        <div className="flex gap-6">
          <button>Home</button>
          <button>Categories</button>
          <button>Cart 🛒</button>
          <button>Login</button>
        </div>

</nav>

<Hero />

{/* Products */}

<div className="p-8">

        <h2 className="text-4xl font-bold mb-8">
          GlobalMart Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

{products.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
  />
))}

        </div>

      </div>

    </main>
  );
}