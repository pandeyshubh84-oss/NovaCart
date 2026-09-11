"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
};

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CATEGORIES PRODUCTS ERROR:", error);
      setLoading(false);
      return;
    }

    const productData = (data || []) as Product[];

    setProducts(productData);

    const uniqueCategories = Array.from(
      new Set(
        productData
          .map((product) => product.category?.trim())
          .filter(Boolean)
      )
    );

    setCategories(uniqueCategories);
    setLoading(false);
  }

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <h1 className="text-4xl md:text-5xl font-bold">
            Shop by Category
          </h1>

          <p className="mt-3 text-blue-100 text-lg">
            Explore NovaCart products by category.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-5 py-3 rounded-xl font-semibold transition ${
              selectedCategory === "All"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            🛍️ All Products
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-3 rounded-xl font-semibold transition ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {selectedCategory === "All"
              ? "All Products"
              : selectedCategory}
          </h2>

          <span className="text-gray-500">
            {filteredProducts.length} Products
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <div className="text-5xl mb-4">📦</div>

            <h3 className="text-xl font-bold text-gray-900">
              No products found
            </h3>

            <p className="text-gray-500 mt-2">
              Try selecting another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="h-64 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                </Link>

                <div className="p-5">
                  <p className="text-sm text-blue-600 font-semibold">
                    {product.category}
                  </p>

                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mt-1 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-gray-500 mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="text-green-600 font-semibold mt-3">
                    {product.stock > 0
                      ? "✓ In Stock"
                      : "Out of Stock"}
                  </p>

                  <Link
                    href={`/product/${product.id}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl mt-4 transition"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}