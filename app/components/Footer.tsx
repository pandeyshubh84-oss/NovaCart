import { STORE } from "../lib/storeInfo";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#d4af37]/30 text-zinc-400 mt-10">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-serif text-2xl tracking-[0.12em] text-[#f5d77a] uppercase mb-3">
            {STORE.name}
          </h3>
          <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">
            Premium streetwear, secure checkout and reliable delivery across
            India.
          </p>
          <p className="text-xs text-[#d4af37] mt-4 tracking-widest uppercase">
            🔒 Secure payments by Razorpay
          </p>
        </div>

        <div>
          <h4 className="text-[#f5d77a] text-xs tracking-[0.2em] uppercase mb-3">
            Shop
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-[#d4af37] transition">Home</a></li>
            <li><a href="/offers" className="hover:text-[#d4af37] transition">Offers</a></li>
            <li><a href="/cart" className="hover:text-[#d4af37] transition">Cart</a></li>
            <li><a href="/my-orders" className="hover:text-[#d4af37] transition">My Orders</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#f5d77a] text-xs tracking-[0.2em] uppercase mb-3">
            Policies
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/shipping-policy" className="hover:text-[#d4af37] transition">Shipping Policy</a></li>
            <li><a href="/refund-policy" className="hover:text-[#d4af37] transition">Return &amp; Refund</a></li>
            <li><a href="/privacy-policy" className="hover:text-[#d4af37] transition">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-[#d4af37] transition">Terms &amp; Conditions</a></li>
            <li><a href="/contact-us" className="hover:text-[#d4af37] transition">Contact Us</a></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h4 className="text-[#f5d77a] text-xs tracking-[0.2em] uppercase mb-3">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-zinc-500 break-words">
            <li>{STORE.email}</li>
            <li>{STORE.phone}</li>
            <li>{STORE.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#d4af37]/15 py-4 text-center text-[11px] text-zinc-600 tracking-widest uppercase">
        © {new Date().getFullYear()} {STORE.name}. All rights reserved.
      </div>
    </footer>
  );
}