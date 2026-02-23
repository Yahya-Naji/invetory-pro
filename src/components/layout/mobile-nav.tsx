"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Menu,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";

const getNavItems = (role: string) => {
  const items = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager"] },
    { title: "Shop", href: "/shop", icon: ShoppingBag, roles: ["viewer"] },
    { title: "My Orders", href: "/my-orders", icon: ShoppingCart, roles: ["viewer"] },
    { title: "Inventory", href: "/inventory", icon: Boxes, roles: ["admin", "manager"] },
    { title: "Categories", href: "/categories", icon: Tags, roles: ["admin", "manager"] },
    { title: "Suppliers", href: "/suppliers", icon: Truck, roles: ["admin", "manager"] },
    { title: "Movements", href: "/movements", icon: ArrowUpDown, roles: ["admin", "manager"] },
    { title: "Alerts", href: "/alerts", icon: Bell, roles: ["admin", "manager"] },
    { title: "All Orders", href: "/orders", icon: ClipboardList, roles: ["admin", "manager"] },
    { title: "AI Search", href: "/ai/search", icon: Search, roles: ["admin", "manager", "viewer"] },
    { title: "AI Assistant", href: "/ai/assistant", icon: MessageSquare, roles: ["admin", "manager", "viewer"] },
    { title: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin"] },
    { title: "Settings", href: "/settings", icon: Settings, roles: ["admin", "manager", "viewer"] },
  ];
  return items.filter((item) => item.roles.includes(role));
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useAuth();
  const navItems = getNavItems(profile?.role || "viewer");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold text-white">Inventory Pro</span>
        </div>
        <nav className="space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-indigo-400")} />
                  {item.title}
                </div>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
