import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { data: items } = await supabase.from("inventory_items").select("id, name, sku, quantity, reorder_level, status").limit(50);
    const { data: movements } = await supabase.from("stock_movements").select("item_id, type, quantity, created_at").order("created_at", { ascending: false }).limit(200);

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        forecasts: z.array(z.object({
          itemName: z.string(),
          currentQty: z.number(),
          predictedDemand: z.string(),
          recommendation: z.string(),
          urgency: z.enum(["high", "medium", "low"]),
        })),
        summary: z.string(),
      }),
      system: "You are an inventory demand forecasting AI. Analyze stock levels and movement patterns to predict future demand and recommend actions.",
      prompt: `Analyze this inventory data and provide demand forecasts:\n\nItems: ${JSON.stringify(items)}\n\nRecent movements: ${JSON.stringify(movements)}`,
    });

    return Response.json(object);
  } catch (error: any) {
    console.error("AI Forecast error:", error);
    return Response.json({ error: error.message || "Forecast failed" }, { status: 500 });
  }
}
