"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, ShoppingBag, Package, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const supabase = createClient();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, movementsRes, ordersRes, orderItemsRes] = await Promise.all([
          supabase.from("inventory_items").select("status, quantity, unit_price, category:categories(name)"),
          supabase.from("stock_movements").select("type, quantity, created_at"),
          supabase.from("orders").select("id, status, total_amount, created_at, customer:profiles(full_name)"),
          supabase.from("order_items").select("item_id, quantity, total_price, item:inventory_items(name, category:categories(name))"),
        ]);

        const items = (itemsRes.data as any) || [];
        const movements = movementsRes.data || [];
        const orders = (ordersRes.data as any) || [];
        const orderItems = (orderItemsRes.data as any) || [];

        // Inventory stats
        const statusMap = new Map<string, number>();
        let totalValue = 0;
        items.forEach((i: any) => {
          statusMap.set(i.status, (statusMap.get(i.status) || 0) + 1);
          totalValue += i.quantity * (i.unit_price || 0);
        });

        const categoryMap = new Map<string, number>();
        items.forEach((i: any) => {
          const cat = i.category?.name || "Uncategorized";
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });

        const totalIn = movements.filter((m: any) => m.type === "in").reduce((s: number, m: any) => s + m.quantity, 0);
        const totalOut = movements.filter((m: any) => m.type === "out").reduce((s: number, m: any) => s + m.quantity, 0);

        // Revenue stats
        const deliveredOrders = orders.filter((o: any) => o.status === "delivered");
        const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
        const pendingRevenue = orders.filter((o: any) => o.status === "pending" || o.status === "approved").reduce((sum: number, o: any) => sum + o.total_amount, 0);

        // Top selling items
        const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();
        orderItems.forEach((oi: any) => {
          const name = oi.item?.name || "Unknown";
          const existing = itemSales.get(name) || { name, quantity: 0, revenue: 0 };
          existing.quantity += oi.quantity;
          existing.revenue += oi.total_price;
          itemSales.set(name, existing);
        });
        const topSelling = Array.from(itemSales.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

        // Revenue by category
        const catRevenue = new Map<string, number>();
        orderItems.forEach((oi: any) => {
          const cat = oi.item?.category?.name || "Uncategorized";
          catRevenue.set(cat, (catRevenue.get(cat) || 0) + oi.total_price);
        });
        const categoryRevenue = Array.from(catRevenue.entries()).map(([cat, rev]) => ({ category: cat, revenue: rev })).sort((a, b) => b.revenue - a.revenue);

        // Recent orders
        const recentOrders = orders.slice(0, 5);

        setData({
          totalItems: items.length,
          totalValue,
          statusBreakdown: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
          categoryBreakdown: Array.from(categoryMap.entries()).map(([cat, count]) => ({ category: cat, count })).sort((a: any, b: any) => b.count - a.count),
          totalIn,
          totalOut,
          totalMovements: movements.length,
          totalRevenue,
          pendingRevenue,
          totalOrders: orders.length,
          deliveredCount: deliveredOrders.length,
          topSelling,
          categoryRevenue,
          recentOrders,
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColors: Record<string, string> = {
    in_stock: "bg-emerald-500",
    low_stock: "bg-amber-500",
    out_of_stock: "bg-red-500",
    ordered: "bg-blue-500",
    discontinued: "bg-gray-500",
  };
  const statusLabels: Record<string, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    ordered: "Ordered",
    discontinued: "Discontinued",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxTopRevenue = data.topSelling[0]?.revenue || 1;
  const maxCatRevenue = data.categoryRevenue[0]?.revenue || 1;

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Revenue, sales, and inventory insights." />

      {/* Revenue KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: `$${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 border border-emerald-100" },
          { label: "Pending Revenue", value: `$${data.pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50 border border-amber-100" },
          { label: "Total Orders", value: data.totalOrders, icon: ShoppingBag, color: "text-indigo-600", bg: "bg-indigo-50 border border-indigo-100" },
          { label: "Inventory Value", value: `$${data.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Package, color: "text-violet-600", bg: "bg-violet-50 border border-violet-100" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Movement KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Stock In", value: data.totalIn, color: "text-emerald-600" },
          { label: "Stock Out", value: data.totalOut, color: "text-red-600" },
          { label: "Total Movements", value: data.totalMovements, color: "text-indigo-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topSelling.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topSelling.map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-medium text-muted-foreground">#{i + 1}</span>
                    <span className="flex-1 truncate text-sm">{item.name}</span>
                    <div className="w-24">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${(item.revenue / maxTopRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-16 text-right text-sm font-medium">${item.revenue.toFixed(0)}</span>
                    <span className="w-10 text-right text-xs text-muted-foreground">{item.quantity}x</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <div className="space-y-3">
                {data.categoryRevenue.map((c: any) => (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className="w-28 truncate text-sm text-muted-foreground">{c.category}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${(c.revenue / maxCatRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-16 text-right text-sm font-medium">${c.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.statusBreakdown.map((s: any) => (
                <div key={s.status} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${statusColors[s.status] || "bg-gray-500"}`} />
                  <span className="w-24 text-sm">{statusLabels[s.status] || s.status}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(s.count / data.totalItems) * 100}%` }} />
                    </div>
                  </div>
                  <span className="w-8 text-right text-sm font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.categoryBreakdown.slice(0, 10).map((c: any) => (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="w-28 truncate text-sm text-muted-foreground">{c.category}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(c.count / data.totalItems) * 100}%` }} />
                    </div>
                  </div>
                  <span className="w-8 text-right text-sm font-medium">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.full_name || "Customer"} &middot;{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">${order.total_amount.toFixed(2)}</p>
                      <p className="text-xs capitalize text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
