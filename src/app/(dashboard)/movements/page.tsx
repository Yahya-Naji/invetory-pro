"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function MovementsPage() {
  const supabase = createClient();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("stock_movements").select("*, item:inventory_items(name, sku), performer:profiles!stock_movements_performed_by_fkey(full_name)").order("created_at", { ascending: false }).limit(100);
      setMovements(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Movements" description="Audit log of all stock changes." />
      {loading ? <Skeleton className="h-96 w-full" /> : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>SKU</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>Reason</TableHead><TableHead>By</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>{movements.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.item?.name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{m.item?.sku || "—"}</TableCell>
                <TableCell><Badge variant={m.type === "in" ? "default" : m.type === "out" ? "destructive" : "secondary"} className="capitalize">{m.type}</Badge></TableCell>
                <TableCell className="text-right font-medium">{m.type === "in" ? "+" : m.type === "out" ? "-" : ""}{m.quantity}</TableCell>
                <TableCell className="text-muted-foreground">{m.reason || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{m.performer?.full_name || "System"}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(m.created_at), "MMM d, h:mm a")}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  );
}
