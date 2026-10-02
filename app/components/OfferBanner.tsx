"use client";

import { useEffect, useState } from "react";
import { OFFER } from "../lib/offerConfig";

function getTimeLeft() {
  const diff = new Date(OFFER.endDate).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function OfferBanner() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hide the banner if it is turned off or the offer has ended
  if (!OFFER.enabled || (mounted && !timeLeft)) return null;

  const box = (value: number, label: string) => (
    <div className="border border-[#d4af37]/40 bg-black rounded-md px-2 py-1 text-center min-w-[46px] md:min-w-[52px]">
      <p className="text-base md:text-lg font-bold leading-none text-[#f5d77a]">
        {String(value).padStart(2, "0")}
      </p>
      <p className="text-[9px] uppercase tracking-widest mt-1 text-zinc-400">
        {label}
      </p>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-black via-[#1a1405] to-black border-b border-[#d4af37]/40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center">
        <p className="text-sm md:text-base text-zinc-300">
          <span className="text-[#d4af37]">✦</span>{" "}
          <span className="font-serif font-bold tracking-widest text-[#f5d77a] uppercase">
            {OFFER.title}
          </span>{" "}
          <span className="text-zinc-400">—</span> {OFFER.message}
        </p>

        {mounted && timeLeft && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">
              Ends in
            </span>
            {box(timeLeft.days, "Days")}
            {box(timeLeft.hours, "Hrs")}
            {box(timeLeft.minutes, "Min")}
            {box(timeLeft.seconds, "Sec")}
          </div>
        )}

        <a
          href={OFFER.buttonLink}
          className="bg-gradient-to-r from-[#d4af37] to-[#f5d77a] text-black font-bold px-5 py-2 rounded-full text-xs md:text-sm tracking-widest uppercase hover:shadow-[0_0_18px_rgba(212,175,55,0.5)] transition-all"
        >
          {OFFER.buttonText}
        </a>
      </div>
    </div>
  );
}