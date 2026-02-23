"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/providers/cart-provider";
import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Package,
  Loader2,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Order } from "@/types";

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  approved: { icon: CheckCircle, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  shipped: { icon: Truck, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  delivered: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  cancelled: { icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export default function MyOrdersPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

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
      setLoadingOrders(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((ci) => ({
            item_id: ci.item.id,
            quantity: ci.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to place order");
        return;
      }

      toast.success(data.message);
      clearCart();
      fetchOrders();
    } catch {
      toast.error("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Orders" description="Your cart and order history." />

      <Tabs defaultValue={items.length > 0 ? "cart" : "orders"}>
        <TabsList>
          <TabsTrigger value="cart" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart {totalItems > 0 && `(${totalItems})`}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Order History
          </TabsTrigger>
        </TabsList>

        {/* Cart Tab */}
        <TabsContent value="cart" className="mt-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse the shop to add items to your cart.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
              {/* Cart Items */}
              <div className="space-y-3">
                {items.map((ci) => (
                  <motion.div
                    key={ci.item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          {ci.item.image_url ? (
                            <img
                              src={ci.item.image_url}
                              alt={ci.item.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{ci.item.name}</h4>
                          <p className="text-xs text-muted-foreground">{ci.item.sku}</p>
                          <p className="mt-1 text-sm font-semibold text-indigo-600">
                            ${(ci.item.unit_price || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {ci.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)}
                            disabled={ci.quantity >= ci.item.quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            ${((ci.item.unit_price || 0) * ci.quantity).toFixed(2)}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => removeItem(ci.item.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" /> Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <Card className="h-fit sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Items ({totalItems})
                      </span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-emerald-600">Free</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Place Order
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-4 space-y-4">
          {loadingOrders ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="mt-2 h-4 w-32" />
                </CardContent>
              </Card>
            ))
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your orders will appear here after you place them.
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order, index) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`gap-1 capitalize ${config.bg} ${config.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {order.status}
                          </Badge>
                          <span className="text-lg font-bold text-indigo-600">
                            ${order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {order.order_items.map((oi) => (
                            <div key={oi.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {oi.item?.name || "Unknown Item"} x{oi.quantity}
                              </span>
                              <span>${oi.total_price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
