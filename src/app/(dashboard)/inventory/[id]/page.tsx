"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Trash2, Plus, Loader2, Boxes, MapPin, DollarSign, Hash, Truck, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { InventoryItem, StockMovement } from "@/types";

const statusColors: Record<string, string> = { in_stock: "bg-green-100 text-green-700", low_stock: "bg-yellow-100 text-yellow-700", out_of_stock: "bg-red-100 text-red-700", ordered: "bg-blue-100 text-blue-700", discontinued: "bg-gray-100 text-gray-700" };
const statusLabels: Record<string, string> = { in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock", ordered: "Ordered", discontinued: "Discontinued" };

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const supabase = createClient();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moveType, setMoveType] = useState("in");
  const [moveQty, setMoveQty] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canManage = profile?.role === "admin" || profile?.role === "manager";

  useEffect(() => {
    const fetch = async () => {
      const [itemRes, movRes] = await Promise.all([
        supabase.from("inventory_items").select("*, category:categories(name), supplier:suppliers(name)").eq("id", params.id).single(),
        supabase.from("stock_movements").select("*").eq("item_id", params.id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (itemRes.error) { toast.error("Item not found"); router.push("/inventory"); return; }
      setItem(itemRes.data as any);
      setMovements(movRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [params.id]);

  const handleMovement = async () => {
    if (!moveQty || !item) return;
    setSubmitting(true);
    const qty = parseInt(moveQty);
    const newQty = moveType === "in" ? item.quantity + qty : moveType === "out" ? Math.max(0, item.quantity - qty) : qty;

    const { error: moveErr } = await supabase.from("stock_movements").insert({ item_id: item.id, type: moveType, quantity: qty, reason: moveReason || null, performed_by: profile?.id });
    if (moveErr) { toast.error("Failed"); setSubmitting(false); return; }

    let status = "in_stock";
    if (newQty === 0) status = "out_of_stock";
    else if (newQty <= item.reorder_level) status = "low_stock";

    await supabase.from("inventory_items").update({ quantity: newQty, status }).eq("id", item.id);

    toast.success("Stock updated");
    setDialogOpen(false);
    setMoveQty("");
    setMoveReason("");
    setSubmitting(false);
    // Refresh
    const { data } = await supabase.from("inventory_items").select("*, category:categories(name), supplier:suppliers(name)").eq("id", item.id).single();
    setItem(data as any);
    const { data: movs } = await supabase.from("stock_movements").select("*").eq("item_id", item.id).order("created_at", { ascending: false }).limit(20);
    setMovements(movs || []);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item?") || !item) return;
    await supabase.from("inventory_items").delete().eq("id", item.id);
    toast.success("Item deleted");
    router.push("/inventory");
  };

  if (loading) return <div className="mx-auto max-w-3xl space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!item) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={item.name}>
          {canManage && (
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><ArrowUpDown className="h-4 w-4" /> Stock Movement</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record Stock Movement</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><Label>Type</Label><Select value={moveType} onValueChange={setMoveType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in">Stock In</SelectItem><SelectItem value="out">Stock Out</SelectItem><SelectItem value="adjustment">Adjustment</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={moveQty} onChange={(e) => setMoveQty(e.target.value)} placeholder="0" /></div>
                    <div className="space-y-2"><Label>Reason</Label><Textarea value={moveReason} onChange={(e) => setMoveReason(e.target.value)} placeholder="Optional reason..." rows={2} /></div>
                    <Button onClick={handleMovement} disabled={submitting} className="w-full">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={() => router.push(`/inventory/${item.id}/edit`)}><Edit className="mr-1 h-4 w-4" /> Edit</Button>
              {profile?.role === "admin" && <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>}
            </div>
          )}
        </PageHeader>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            <Badge className={`text-sm ${statusColors[item.status]}`}>{statusLabels[item.status]}</Badge>
            <div className="flex items-center gap-1 text-sm"><Hash className="h-4 w-4 text-muted-foreground" /> SKU: <span className="font-medium">{item.sku}</span></div>
            <div className="flex items-center gap-1 text-sm"><Boxes className="h-4 w-4 text-muted-foreground" /> Qty: <span className="font-medium">{item.quantity}</span></div>
            {item.unit_price && <div className="flex items-center gap-1 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground" /> ${item.unit_price.toFixed(2)}</div>}
            {item.location && <div className="flex items-center gap-1 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> {item.location}</div>}
            {(item.category as any)?.name && <div className="flex items-center gap-1 text-sm"><Badge variant="secondary">{(item.category as any).name}</Badge></div>}
            {(item.supplier as any)?.name && <div className="flex items-center gap-1 text-sm"><Truck className="h-4 w-4 text-muted-foreground" /> {(item.supplier as any).name}</div>}
          </div>
          {item.description && <><Separator className="my-4" /><p className="text-sm text-muted-foreground">{item.description}</p></>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Stock Movements</CardTitle></CardHeader>
        <CardContent>
          {movements.length === 0 ? <p className="text-sm text-muted-foreground">No movements recorded yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>Reason</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell><Badge variant={m.type === "in" ? "default" : m.type === "out" ? "destructive" : "secondary"} className="capitalize">{m.type}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{m.type === "in" ? "+" : m.type === "out" ? "-" : ""}{m.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{m.reason || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(m.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
