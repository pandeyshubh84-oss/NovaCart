"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/offers", label: "Offers", highlight: true },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

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

  const linkClass = (highlight?: boolean) =>
    highlight
      ? "text-[#f5d77a] font-semibold tracking-widest uppercase text-xs hover:text-white transition"
      : "text-zinc-300 tracking-widest uppercase text-xs hover:text-[#d4af37] transition";

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-[#d4af37]/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl md:text-3xl tracking-widest">
          <span className="text-white">NOVA</span>
          <span className="text-[#d4af37]">CART</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.highlight)}
            >
              {link.label}
            </Link>
          ))}

          {!loading &&
            (user ? (
              <>
                <Link href="/my-orders" className={linkClass()}>
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="border border-[#d4af37]/60 text-[#d4af37] px-4 py-2 rounded-full text-xs tracking-widest uppercase hover:bg-[#d4af37] hover:text-black transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-[#d4af37] to-[#f5d77a] text-black font-bold px-5 py-2 rounded-full text-xs tracking-widest uppercase hover:shadow-[0_0_18px_rgba(212,175,55,0.5)] transition"
              >
                Login
              </Link>
            ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#d4af37] text-2xl w-10 h-10 border border-[#d4af37]/40 rounded-lg"
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#d4af37]/20 bg-black px-4 py-5 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={linkClass(link.highlight)}
            >
              {link.label}
            </Link>
          ))}

          {!loading &&
            (user ? (
              <>
                <Link
                  href="/my-orders"
                  onClick={() => setMenuOpen(false)}
                  className={linkClass()}
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="border border-[#d4af37]/60 text-[#d4af37] px-4 py-3 rounded-full text-xs tracking-widest uppercase"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-gradient-to-r from-[#d4af37] to-[#f5d77a] text-black font-bold px-5 py-3 rounded-full text-xs tracking-widest uppercase text-center"
              >
                Login
              </Link>
            ))}
        </div>
      )}
    </nav>
  );
}