"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusLabels: Record<string, string> = { in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock", ordered: "Ordered", discontinued: "Discontinued" };

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/smart-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.items);
      setInterpretation(data.interpretation);
    } catch { toast.error("Search failed"); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Smart Search" description="Search inventory using natural language. Try 'items running low in warehouse A'." />
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1"><Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-500" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Describe what you're looking for..." className="pl-9" /></div>
          <Button type="submit" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Search</Button>
        </form>
      </CardContent></Card>

      {interpretation && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-yellow-500" /> AI Interpretation</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{interpretation}</p></CardContent></Card></motion.div>}

      {results.length > 0 && (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>Status</TableHead><TableHead>Location</TableHead></TableRow></TableHeader>
            <TableBody>{results.map((item: any) => (
              <TableRow key={item.id} className="cursor-pointer" onClick={() => router.push(`/inventory/${item.id}`)}>
                <TableCell className="font-medium">{item.name}</TableCell><TableCell>{item.sku}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell><Badge variant="secondary">{statusLabels[item.status] || item.status}</Badge></TableCell><TableCell className="text-muted-foreground">{item.location || "—"}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  );
}
