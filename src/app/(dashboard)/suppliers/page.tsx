"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Supplier } from "@/types";

export default function SuppliersPage() {
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", contact_email: "", contact_phone: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => { const { data } = await supabase.from("suppliers").select("*").order("name"); setSuppliers(data || []); setLoading(false); };
  useEffect(() => { fetchSuppliers(); }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("suppliers").insert({ name: form.name, contact_email: form.contact_email || null, contact_phone: form.contact_phone || null, address: form.address || null, notes: form.notes || null });
    if (error) { toast.error("Failed"); setSubmitting(false); return; }
    toast.success("Supplier added");
    setDialogOpen(false);
    setForm({ name: "", contact_email: "", contact_phone: "", address: "", notes: "" });
    setSubmitting(false);
    fetchSuppliers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    await supabase.from("suppliers").delete().eq("id", id);
    toast.success("Supplier deleted");
    fetchSuppliers();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" description="Manage your suppliers.">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add Supplier</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Email</Label><Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="email@supplier.com" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="+1 234 567 890" /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              <Button onClick={handleAdd} disabled={submitting} className="w-full">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Supplier</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Address</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{suppliers.map((s) => (
            <TableRow key={s.id}><TableCell className="font-medium">{s.name}</TableCell><TableCell className="text-muted-foreground">{s.contact_email || "—"}</TableCell><TableCell className="text-muted-foreground">{s.contact_phone || "—"}</TableCell><TableCell className="text-muted-foreground">{s.address || "—"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
