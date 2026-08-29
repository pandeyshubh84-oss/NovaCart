"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
    } else {
      setProduct(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl font-bold">Loading Product...</h2>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl font-bold text-red-600">
          Product Not Found
        </h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-8">

        <Link
          href="/"
          className="text-blue-600 font-semibold hover:underline"
        >
          ← Back to Home
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mt-8 bg-white rounded-3xl shadow-xl p-8">

          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-2xl object-cover"
            />
          </div>

          <div>

            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {product.category}
            </span>

            <h1 className="text-5xl font-bold mt-5">
              {product.name}
            </h1>

            <p className="text-gray-600 mt-5 text-lg">
              {product.description}
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-8">
              ₹{product.price}
            </h2>

            <p className="mt-3 text-lg">
              Stock Available :
              <span className="font-bold text-blue-600">
                {" "}
                {product.stock}
              </span>
            </p>

            <div className="flex gap-4 mt-10">

              <button
                onClick={() => addToCart(product)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-xl font-bold"
              >
                🛒 Add to Cart
              </button>

              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-xl font-bold"
              >
                Buy Now
              </button>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}