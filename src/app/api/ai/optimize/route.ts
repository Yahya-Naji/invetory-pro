import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { data: items } = await supabase.from("inventory_items").select("*");
    const { data: movements } = await supabase.from("stock_movements").select("item_id, type, quantity, created_at").order("created_at", { ascending: false }).limit(300);

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        suggestions: z.array(z.object({
          type: z.enum(["reorder", "overstock", "dead_stock", "optimize"]),
          itemName: z.string(),
          description: z.string(),
          action: z.string(),
          priority: z.enum(["high", "medium", "low"]),
        })),
        overallHealth: z.string(),
        costSavingOpportunities: z.string(),
      }),
      system: "You are an inventory optimization AI. Analyze inventory data to identify reorder needs, dead stock, overstock situations, and cost-saving opportunities.",
      prompt: `Optimize this inventory:\n\nItems: ${JSON.stringify(items)}\n\nMovements: ${JSON.stringify(movements)}`,
    });

    return Response.json(object);
  } catch (error: any) {
    console.error("AI Optimize error:", error);
    return Response.json({ error: error.message || "Optimization failed" }, { status: 500 });
  }
}
