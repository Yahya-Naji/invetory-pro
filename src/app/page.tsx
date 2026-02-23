"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  Sparkles,
  Shield,
  ArrowRight,
  Zap,
  TrendingUp,
  Boxes,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const heroImages = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80",
];

const features = [
  {
    icon: Boxes,
    title: "Real-Time Tracking",
    description:
      "Monitor stock levels, locations, and supplier info across all warehouses instantly.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: TrendingUp,
    title: "AI Forecasting",
    description:
      "Predict demand patterns and optimize reorder points with machine learning.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Sparkles,
    title: "Smart Search",
    description:
      'Natural language queries like "items running low in warehouse A" just work.',
    gradient: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Admin, Manager, and Viewer roles with granular permissions for your team.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "50ms", label: "Avg Response" },
  { value: "10K+", label: "Items Tracked" },
  { value: "AI", label: "Powered" },
];

export default function LandingPage() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - transparent over hero */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-md">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Inventory Pro
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-white/15 text-white backdrop-blur-md hover:bg-white/25 border border-white/20"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero with full-screen background slider */}
        <section className="relative h-screen min-h-[700px] overflow-hidden">
          {/* Rotating background images */}
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={heroImages[current] || heroImages[0]}
              alt="Inventory background"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Dark gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-violet-900/20" />

          {/* Hero content */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md">
                <Zap className="h-3.5 w-3.5" />
                AI-Powered Inventory Management
              </div>
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
                Control your
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  entire inventory
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                From demand forecasting to smart reordering, Inventory Pro uses AI
                to keep your stock optimized and your business running smoothly.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 px-8 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600"
                  >
                    Start Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/25 bg-white/10 px-8 text-white backdrop-blur-md hover:bg-white/20"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 grid w-full max-w-2xl grid-cols-4 divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-lg"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Image slider dots */}
            <div className="mt-8 flex gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-white px-4 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Everything you need
              </h2>
              <p className="mt-3 text-muted-foreground">
                Powerful features to streamline your inventory operations.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50 to-white p-8 transition-all hover:shadow-lg"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl">
          Inventory Pro &copy; {new Date().getFullYear()}. Built with AI.
        </div>
      </footer>
    </div>
  );
}
