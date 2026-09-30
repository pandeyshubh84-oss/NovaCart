import Navbar from "./Navbar";
import { STORE } from "../lib/storeInfo";

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function PolicyLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">
            Last updated: {STORE.lastUpdated}
          </p>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 pb-10 space-x-4">
        <a href="/shipping-policy" className="hover:text-gray-900">Shipping</a>
        <a href="/refund-policy" className="hover:text-gray-900">Refunds</a>
        <a href="/privacy-policy" className="hover:text-gray-900">Privacy</a>
        <a href="/terms" className="hover:text-gray-900">Terms</a>
        <a href="/contact-us" className="hover:text-gray-900">Contact</a>
      </footer>
    </main>
  );
}