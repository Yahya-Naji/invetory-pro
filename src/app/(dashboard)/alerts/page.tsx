"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, PackageX } from "lucide-react";
import { motion } from "framer-motion";
import type { InventoryItem } from "@/types";

export default function AlertsPage() {
  const supabase = createClient();
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [lowRes, outRes] = await Promise.all([
        supabase.from("inventory_items").select("*").eq("status", "low_stock").order("quantity"),
        supabase.from("inventory_items").select("*").eq("status", "out_of_stock").order("name"),
      ]);
      setLowStockItems(lowRes.data || []);
      setOutOfStockItems(outRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const totalAlerts = lowStockItems.length + outOfStockItems.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts" description={`${totalAlerts} items need attention.`} />

      {totalAlerts === 0 && !loading ? (
        <EmptyState icon={Bell} title="No alerts" description="All inventory levels are healthy." />
      ) : (
        <div className="space-y-6">
          {outOfStockItems.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-600"><PackageX className="h-5 w-5" /> Out of Stock ({outOfStockItems.length})</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {outOfStockItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-red-200 bg-red-50/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">SKU: {item.sku}</p></div>
                        <Badge variant="destructive">Out of Stock</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-yellow-600"><AlertTriangle className="h-5 w-5" /> Low Stock ({lowStockItems.length})</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lowStockItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-yellow-200 bg-yellow-50/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">Qty: {item.quantity} / Reorder: {item.reorder_level}</p></div>
                        <Badge className="bg-yellow-100 text-yellow-700">Low Stock</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
