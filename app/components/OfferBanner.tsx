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
    <div className="bg-white/20 rounded-lg px-2 py-1 text-center min-w-[52px]">
      <p className="text-lg font-bold leading-none">
        {String(value).padStart(2, "0")}
      </p>
      <p className="text-[10px] uppercase tracking-wide mt-1">{label}</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center">
        <p className="font-semibold">
          🎉 <span className="font-bold">{OFFER.title}</span> —{" "}
          {OFFER.message}
        </p>

        {mounted && timeLeft && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Ends in</span>
            {box(timeLeft.days, "Days")}
            {box(timeLeft.hours, "Hrs")}
            {box(timeLeft.minutes, "Min")}
            {box(timeLeft.seconds, "Sec")}
          </div>
        )}

        <a
          href={OFFER.buttonLink}
          className="bg-white text-red-600 font-semibold px-5 py-2 rounded-full text-sm hover:bg-yellow-100"
        >
          {OFFER.buttonText}
        </a>
      </div>
    </div>
  );
}