"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Boxes,
  AlertTriangle,
  DollarSign,
  ArrowUpDown,
  ShoppingBag,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Order } from "@/types";

// ---------- ADMIN / MANAGER DASHBOARD ----------
function AdminDashboard({ name }: { name: string }) {
  const supabase = createClient();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [itemsRes, lowStockRes, movementsRes, ordersRes] = await Promise.all([
          supabase.from("inventory_items").select("quantity, unit_price"),
          supabase.from("inventory_items").select("id").in("status", ["low_stock", "out_of_stock"]),
          supabase.from("stock_movements").select("id").gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from("orders").select("id, status, total_amount"),
        ]);

        const items = itemsRes.data || [];
        const totalValue = items.reduce((sum: number, item: any) => sum + (item.quantity * (item.unit_price || 0)), 0);
        const orders = ordersRes.data || [];
        const revenue = orders.filter((o: any) => o.status === "delivered").reduce((s: number, o: any) => s + o.total_amount, 0);
        const pendingOrders = orders.filter((o: any) => o.status === "pending").length;

        setStats({
          totalItems: items.length,
          lowStockItems: lowStockRes.data?.length || 0,
          totalValue,
          recentMovements: movementsRes.data?.length || 0,
          totalRevenue: revenue,
          totalOrders: orders.length,
          pendingOrders,
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { title: "Total Items", value: stats.totalItems, subtitle: "In inventory", icon: Boxes, iconColor: "text-indigo-600", iconBg: "bg-indigo-50 border border-indigo-100" },
        { title: "Low Stock", value: stats.lowStockItems, subtitle: "Need attention", icon: AlertTriangle, iconColor: "text-amber-600", iconBg: "bg-amber-50 border border-amber-100" },
        { title: "Inventory Value", value: `$${stats.totalValue.toLocaleString()}`, subtitle: "Total value", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border border-emerald-100" },
        { title: "Movements (7d)", value: stats.recentMovements, subtitle: "Recent activity", icon: ArrowUpDown, iconColor: "text-violet-600", iconBg: "bg-violet-50 border border-violet-100" },
        { title: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, subtitle: "From delivered orders", icon: TrendingUp, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border border-emerald-100" },
        { title: "Total Orders", value: stats.totalOrders, subtitle: `${stats.pendingOrders} pending`, icon: ShoppingBag, iconColor: "text-indigo-600", iconBg: "bg-indigo-50 border border-indigo-100" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Here's your inventory and sales overview."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.08 }}>
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`rounded-xl p-2.5 ${stat.iconBg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/inventory">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <Boxes className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium">Manage Inventory</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/orders">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <ShoppingBag className="h-5 w-5 text-violet-500" />
              <span className="text-sm font-medium">View Orders</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium">Analytics</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// ---------- VIEWER (SHOPPER) DASHBOARD ----------
const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  approved: { icon: CheckCircle, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  shipped: { icon: Truck, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  delivered: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  cancelled: { icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

function ViewerDashboard({ name }: { name: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalSpent = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total_amount, 0);
  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${name}`}
        description="Browse products, track your orders, and discover deals."
      />

      {/* Viewer KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "My Orders", value: orders.length, subtitle: `${activeOrders} active`, icon: ShoppingCart, iconColor: "text-indigo-600", iconBg: "bg-indigo-50 border border-indigo-100" },
          { title: "Total Spent", value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, subtitle: "Delivered orders", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50 border border-emerald-100" },
          { title: "Active Orders", value: activeOrders, subtitle: "In progress", icon: Package, iconColor: "text-violet-600", iconBg: "bg-violet-50 border border-violet-100" },
        ].map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`rounded-xl p-2.5 ${stat.iconBg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/shop">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-200">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 p-3">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Browse Shop</h3>
                <p className="text-sm text-muted-foreground">Discover products and add to cart</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/ai/search">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-violet-200">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">AI Search</h3>
                <p className="text-sm text-muted-foreground">Find products with natural language</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Link href="/my-orders">
            <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
              <h3 className="mt-3 text-sm font-medium">No orders yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">Start shopping to see your orders here.</p>
              <Link href="/shop">
                <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Browse Shop
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order, index) => {
                const config = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {order.order_items && ` · ${order.order_items.length} item${order.order_items.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`gap-1 capitalize ${config.bg} ${config.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {order.status}
                      </Badge>
                      <span className="text-sm font-bold text-indigo-600">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- MAIN PAGE ----------
export default function DashboardPage() {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || "User";
  const role = profile?.role || "viewer";

  if (role === "viewer") {
    return <ViewerDashboard name={name} />;
  }

  return <AdminDashboard name={name} />;
}
