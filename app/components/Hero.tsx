"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Slide = {
  id: string;
  name: string;
  price: number;
  image: string;
};

// Jab tak products load na ho ya koi product na ho, ye photo dikhegi
const FALLBACK: Slide[] = [
  {
    id: "fallback",
    name: "NovaCart Streetwear",
    price: 0,
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900",
  },
];

const isVideo = (url: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(url);

export default function Hero() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK);
  const [active, setActive] = useState(0);

  // Latest 5 products Supabase se lao
  useEffect(() => {
    let mounted = true;

    async function loadSlides() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !data) return;

      const withImages = (data as Slide[]).filter((p) => p.image);
      if (mounted && withImages.length > 0) {
        setSlides(withImages);
        setActive(0);
      }
    }

    loadSlides();

    return () => {
      mounted = false;
    };
  }, []);

  // Har 3.5 second mein agli slide
  useEffect(() => {
    if (slides.length < 2) return;

    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides]);

  return (
    <section className="relative bg-[#0a0a0a] text-white overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.18),transparent_60%)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* Left Content */}
        <div>
          <span className="inline-block border border-[#d4af37]/50 bg-[#d4af37]/10 text-[#f5d77a] text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6">
            ✦ Festive Sale • Limited Time
          </span>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight tracking-wide">
            Wear the
            <br />
            <span className="text-[#d4af37]">Royal Drop</span>
          </h1>

          <p className="mt-6 text-sm md:text-lg text-zinc-400 leading-7 md:leading-8 max-w-xl">
            Premium streetwear, footwear and accessories, handpicked for
            your style. Fast delivery across India, secure checkout and
            cash on delivery.
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 mt-8">
            <Link
              href="#products"
              className="bg-gradient-to-r from-[#d4af37] to-[#f5d77a] text-black font-bold px-7 md:px-8 py-3 md:py-4 rounded-full text-xs md:text-sm tracking-widest uppercase hover:shadow-[0_0_22px_rgba(212,175,55,0.5)] transition-all"
            >
              Shop Now
            </Link>

            <Link
              href="/cart"
              className="border border-[#d4af37]/60 text-[#d4af37] px-7 md:px-8 py-3 md:py-4 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-[#d4af37] hover:text-black transition-all"
            >
              View Cart
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 mt-10 md:mt-12 border-t border-[#d4af37]/20 pt-6">
            <div>
              <h3 className="font-serif text-xl md:text-3xl text-[#f5d77a]">
                COD
              </h3>
              <p className="text-zinc-500 text-[11px] md:text-sm mt-1">
                Cash on Delivery
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl md:text-3xl text-[#f5d77a]">
                Razorpay
              </h3>
              <p className="text-zinc-500 text-[11px] md:text-sm mt-1">
                Secure Payments
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl md:text-3xl text-[#f5d77a]">
                India
              </h3>
              <p className="text-zinc-500 text-[11px] md:text-sm mt-1">
                Wide Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live product slideshow */}
        <div className="flex justify-center">
          <div className="p-2 rounded-3xl border border-[#d4af37]/40 shadow-[0_0_40px_rgba(212,175,55,0.15)] w-full max-w-md md:max-w-lg">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-black">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  className={
                    i === active
                      ? "absolute inset-0 transition-opacity duration-700 opacity-100"
                      : "absolute inset-0 transition-opacity duration-700 opacity-0 pointer-events-none"
                  }
                >
                  {isVideo(slide.image) ? (
                    i === active && (
                      <video
                        src={slide.image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Naam aur price */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-12">
                    <p className="font-serif text-base md:text-lg text-white tracking-wide truncate">
                      {slide.name}
                    </p>
                    {slide.price > 0 && (
                      <p className="text-[#f5d77a] font-bold text-sm md:text-base mt-1">
                        ₹{Number(slide.price).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Dots */}
              {slides.length > 1 && (
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      onClick={() => setActive(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={
                        i === active
                          ? "h-1.5 w-6 rounded-full bg-[#d4af37] transition-all"
                          : "h-1.5 w-1.5 rounded-full bg-white/40 transition-all"
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}