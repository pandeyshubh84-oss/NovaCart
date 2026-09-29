"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed. Please try again.");
      console.error("LOGOUT ERROR:", error);
      return;
    }

    window.location.href = "/";
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="text-3xl font-extrabold text-blue-600"
        >
          🛍️ NovaCart
        </Link>

        <div className="flex items-center gap-6 font-semibold">
          <Link
            href="/"
            className="hover:text-blue-600 transition"
          >
            Home
          </Link>

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

          {!loading &&
            (user ? (
              <>
                <Link
                  href="/my-orders"
                  className="hover:text-blue-600 transition"
                >
                  My Orders
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 transition"
              >
                Login
              </Link>
            ))}
        </div>
      </div>
    </nav>
  );
}