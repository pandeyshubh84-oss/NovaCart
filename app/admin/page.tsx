"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setEmail(session.user.email || "");
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    alert("Logged out successfully.");

    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              NovaCart Admin
            </h1>

            <p className="text-gray-600 mt-2">
              Logged in as <strong>{email}</strong>
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Logout
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <Link
            href="/admin/products"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-bold">
              📦 Products
            </h2>

            <p className="text-gray-600 mt-2">
              Add, edit and manage products.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-bold">
              🛒 Orders
            </h2>

            <p className="text-gray-600 mt-2">
              View and update customer orders.
            </p>
          </Link>

        </div>

      </div>
    </main>
  );
}