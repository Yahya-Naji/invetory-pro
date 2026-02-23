"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    name: "Premium Watches",
    price: "$149.99",
    category: "Accessories",
  },
  {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    name: "Wireless Headphones",
    price: "$79.99",
    category: "Electronics",
  },
  {
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
    name: "Running Shoes",
    price: "$89.99",
    category: "Sports & Outdoors",
  },
  {
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80",
    name: "Instant Camera",
    price: "$69.99",
    category: "Electronics",
  },
  {
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=80",
    name: "Designer Sunglasses",
    price: "$49.99",
    category: "Accessories",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current] || slides[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left panel - full background image slider */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Rotating background images */}
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slide.image}
            alt={slide.name}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

        {/* Content on top */}
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">Inventory Pro</span>
          </div>

          {/* Bottom content */}
          <div>
            {/* Product info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/90">
                  {slide.category}
                </span>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  {slide.name}
                </h2>
                <p className="mt-1 text-2xl font-semibold text-white/90">
                  {slide.price}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots + tagline */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40">
                &copy; {new Date().getFullYear()} Inventory Pro
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
