"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AIForecastPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/forecast", { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch { toast.error("Forecast failed"); } finally { setLoading(false); }
  };

  const urgencyColors: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Demand Forecast" description="AI-powered demand predictions based on stock movement patterns.">
        <Button onClick={runForecast} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Run Forecast</Button>
      </PageHeader>

      {data ? (
        <>
          <Card><CardHeader><CardTitle className="text-sm">Summary</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{data.summary}</p></CardContent></Card>
          <div className="grid gap-4 md:grid-cols-2">
            {data.forecasts?.map((f: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">{f.itemName}</CardTitle>
                    <Badge className={urgencyColors[f.urgency]}>{f.urgency}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><span className="text-muted-foreground">Current:</span> {f.currentQty} units</p>
                    <p className="text-sm"><span className="text-muted-foreground">Predicted Demand:</span> {f.predictedDemand}</p>
                    <p className="text-sm font-medium">{f.recommendation}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <Card><CardContent className="flex flex-col items-center py-12"><TrendingUp className="mb-4 h-12 w-12 text-muted-foreground/30" /><p className="text-muted-foreground">Click &quot;Run Forecast&quot; to analyze demand patterns.</p></CardContent></Card>
      )}
    </div>
  );
}
