"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { InventoryItem, Category, Supplier } from "@/types";

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    Promise.all([
      supabase.from("inventory_items").select("*").eq("id", params.id).single(),
      supabase.from("categories").select("*").order("name"),
      supabase.from("suppliers").select("*").order("name"),
    ]).then(([itemRes, catRes, supRes]) => {
      if (itemRes.error) { toast.error("Item not found"); router.push("/inventory"); return; }
      setItem(itemRes.data);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
      setForm({
        name: itemRes.data.name, sku: itemRes.data.sku, quantity: itemRes.data.quantity.toString(),
        category_id: itemRes.data.category_id || "", description: itemRes.data.description || "",
        image_url: itemRes.data.image_url || "", unit_price: itemRes.data.unit_price?.toString() || "",
        supplier_id: itemRes.data.supplier_id || "", location: itemRes.data.location || "",
        reorder_level: itemRes.data.reorder_level.toString(), barcode: itemRes.data.barcode || "",
        status: itemRes.data.status,
      });
      setLoading(false);
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("inventory_items").update({
      name: form.name, sku: form.sku, quantity: parseInt(form.quantity),
      category_id: form.category_id || null, description: form.description || null,
      image_url: form.image_url || null, unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
      supplier_id: form.supplier_id || null, location: form.location || null,
      reorder_level: parseInt(form.reorder_level) || 10, barcode: form.barcode || null,
      status: form.status, updated_at: new Date().toISOString(),
    }).eq("id", params.id);
    if (error) { toast.error("Failed to update"); setSaving(false); return; }
    toast.success("Item updated");
    router.push(`/inventory/${params.id}`);
  };

  if (loading) return <div className="mx-auto max-w-2xl space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Item" description={`Editing: ${item?.name}`} />
      <Card><CardHeader><CardTitle>Item Details</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>SKU *</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="space-y-2"><Label>Unit Price</Label><Input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} /></div>
            <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Category</Label><Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in_stock">In Stock</SelectItem><SelectItem value="low_stock">Low Stock</SelectItem><SelectItem value="out_of_stock">Out of Stock</SelectItem><SelectItem value="ordered">Ordered</SelectItem><SelectItem value="discontinued">Discontinued</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="space-y-2"><Label>Barcode</Label><Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div className="flex gap-3"><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent></Card>
    </div>
  );
}
