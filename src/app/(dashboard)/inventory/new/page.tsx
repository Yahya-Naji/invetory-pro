"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Category, Supplier } from "@/types";

export default function NewItemPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    name: "", sku: "", quantity: "", category_id: "", description: "", image_url: "",
    unit_price: "", supplier_id: "", location: "", reorder_level: "10", barcode: "",
  });

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("suppliers").select("*").order("name"),
    ]).then(([catRes, supRes]) => {
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
    });
  }, []);

  const handleChange = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const quantity = parseInt(form.quantity) || 0;
    const reorderLevel = parseInt(form.reorder_level) || 10;
    let status = "in_stock";
    if (quantity === 0) status = "out_of_stock";
    else if (quantity <= reorderLevel) status = "low_stock";

    const { error } = await supabase.from("inventory_items").insert({
      name: form.name, sku: form.sku, quantity,
      category_id: form.category_id || null, description: form.description || null,
      image_url: form.image_url || null, unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
      supplier_id: form.supplier_id || null, location: form.location || null,
      reorder_level: reorderLevel, barcode: form.barcode || null,
      status, created_by: profile?.id,
    });

    if (error) { toast.error("Failed to add item"); setLoading(false); return; }
    toast.success("Item added successfully");
    router.push("/inventory");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Add New Item" description="Add a new item to your inventory." />
      <Card>
        <CardHeader><CardTitle>Item Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required placeholder="Item name" /></div>
              <div className="space-y-2"><Label>SKU *</Label><Input value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} required placeholder="SKU-001" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Quantity *</Label><Input type="number" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} required placeholder="0" /></div>
              <div className="space-y-2"><Label>Unit Price</Label><Input type="number" step="0.01" value={form.unit_price} onChange={(e) => handleChange("unit_price", e.target.value)} placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" value={form.reorder_level} onChange={(e) => handleChange("reorder_level", e.target.value)} placeholder="10" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => handleChange("category_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={form.supplier_id} onValueChange={(v) => handleChange("supplier_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="Warehouse A, Shelf 3" /></div>
              <div className="space-y-2"><Label>Barcode</Label><Input value={form.barcode} onChange={(e) => handleChange("barcode", e.target.value)} placeholder="Barcode number" /></div>
            </div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => handleChange("image_url", e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Item description..." rows={3} /></div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Item</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
