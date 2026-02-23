"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AIOptimizePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runOptimize = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/optimize", { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch { toast.error("Optimization failed"); } finally { setLoading(false); }
  };

  const typeColors: Record<string, string> = { reorder: "bg-blue-100 text-blue-700", overstock: "bg-yellow-100 text-yellow-700", dead_stock: "bg-red-100 text-red-700", optimize: "bg-green-100 text-green-700" };
  const priorityColors: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Optimize" description="Get AI-powered optimization suggestions for your inventory.">
        <Button onClick={runOptimize} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Analyze</Button>
      </PageHeader>

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-sm">Overall Health</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{data.overallHealth}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Cost Saving Opportunities</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{data.costSavingOpportunities}</p></CardContent></Card>
          </div>
          <div className="space-y-3">
            {data.suggestions?.map((s: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className={typeColors[s.type]}>{s.type.replace("_", " ")}</Badge>
                        <Badge className={priorityColors[s.priority]}>{s.priority}</Badge>
                        <span className="font-medium">{s.itemName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                      <p className="mt-1 text-sm font-medium">{s.action}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <Card><CardContent className="flex flex-col items-center py-12"><Lightbulb className="mb-4 h-12 w-12 text-muted-foreground/30" /><p className="text-muted-foreground">Click &quot;Analyze&quot; to get optimization suggestions.</p></CardContent></Card>
      )}
    </div>
  );
}
