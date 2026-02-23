"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  Package,
  LayoutDashboard,
  Boxes,
  Tags,
  Truck,
  ArrowUpDown,
  Bell,
  Sparkles,
  Search,
  MessageSquare,
  BarChart3,
  Settings,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";

const getNavItems = (role: string) => {
  const items = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager"] },
    { type: "separator" as const, title: "Shopping", roles: ["viewer"] },
    { title: "Shop", href: "/shop", icon: ShoppingBag, roles: ["viewer"] },
    { title: "My Orders", href: "/my-orders", icon: ShoppingCart, roles: ["viewer"] },
    { type: "separator" as const, title: "Inventory", roles: ["admin", "manager"] },
    { title: "Inventory", href: "/inventory", icon: Boxes, roles: ["admin", "manager"] },
    { title: "Categories", href: "/categories", icon: Tags, roles: ["admin", "manager"] },
    { title: "Suppliers", href: "/suppliers", icon: Truck, roles: ["admin", "manager"] },
    { title: "Movements", href: "/movements", icon: ArrowUpDown, roles: ["admin", "manager"] },
    { title: "Alerts", href: "/alerts", icon: Bell, roles: ["admin", "manager"] },
    { type: "separator" as const, title: "Orders", roles: ["admin", "manager"] },
    { title: "All Orders", href: "/orders", icon: ClipboardList, roles: ["admin", "manager"] },
    { type: "separator" as const, title: "AI Features", roles: ["admin", "manager", "viewer"] },
    { title: "AI Search", href: "/ai/search", icon: Search, roles: ["admin", "manager", "viewer"] },
    { title: "AI Forecast", href: "/ai/forecast", icon: Sparkles, roles: ["admin", "manager"] },
    { title: "AI Optimize", href: "/ai/optimize", icon: BarChart3, roles: ["admin", "manager"] },
    { title: "AI Assistant", href: "/ai/assistant", icon: MessageSquare, roles: ["admin", "manager", "viewer"] },
    { type: "separator" as const, title: "Admin", roles: ["admin"] },
    { title: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin"] },
    { title: "Settings", href: "/settings", icon: Settings, roles: ["admin", "manager", "viewer"] },
  ];
  return items.filter((item) => item.roles?.includes(role));
};

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const navItems = getNavItems(profile?.role || "viewer");

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
          <Package className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-white">Inventory Pro</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item, index) => {
          if ("type" in item && item.type === "separator") {
            return (
              <div key={index} className="pb-1 pt-5">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {item.title}
                </p>
              </div>
            );
          }
          if (!("href" in item)) return null;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon!;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-indigo-400")} />
                {item.title}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
