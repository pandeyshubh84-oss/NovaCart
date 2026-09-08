"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const ADMIN_EMAIL = "j.ptravels2297@gmail.com";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const userEmail = session.user.email?.toLowerCase() || "";

      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        alert("⛔ Access denied. Admin only.");

        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      setEmail(session.user.email || "");
      setLoading(false);
    } catch (error) {
      console.error("ADMIN AUTH ERROR:", error);

      alert("Unable to verify admin access.");

      router.replace("/login");
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    alert("Logged out successfully.");

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">🔐</div>

          <h2 className="text-2xl font-bold text-gray-900">
            Verifying Admin Access...
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl">
                  👑
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    NovaCart Admin
                  </h1>

                  <p className="text-green-600 font-semibold mt-1">
                    ✓ Admin Access Verified
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mt-4">
                Logged in as{" "}
                <strong className="text-gray-900">
                  {email}
                </strong>
              </p>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              Logout
            </button>

          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          <Link
            href="/admin/products"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-3xl mb-5">
              📦
            </div>

            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
              Products
            </h2>

            <p className="text-gray-600 mt-2">
              Add, edit and manage NovaCart products.
            </p>

            <div className="mt-5 text-blue-600 font-semibold">
              Manage Products →
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition"
          >
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-3xl mb-5">
              🛒
            </div>

            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition">
              Orders
            </h2>

            <p className="text-gray-600 mt-2">
              View and manage customer orders and payments.
            </p>

            <div className="mt-5 text-green-600 font-semibold">
              Manage Orders →
            </div>
          </Link>

        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex gap-3">
            <span className="text-xl">🔒</span>

            <div>
              <h3 className="font-bold text-blue-900">
                Admin Security Active
              </h3>

              <p className="text-sm text-blue-800 mt-1">
                Only the authorized NovaCart admin account can access
                this dashboard. Database-level protection is also
                enabled through Supabase Row Level Security.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}