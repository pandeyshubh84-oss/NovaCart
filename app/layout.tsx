import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";

export const metadata: Metadata = {
  title: "NovaCart | Premium Online Shopping",
  description:
    "NovaCart is your premium online shopping destination for clothing, shoes, electronics, accessories, and much more.",
  keywords: [
    "NovaCart",
    "Online Shopping",
    "E-Commerce",
    "Clothing",
    "Shoes",
    "Fashion",
    "Electronics",
    "India",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}