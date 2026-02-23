import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { query } = await request.json();

    const { object: filters } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        name: z.string().describe("Product name filter, or empty string if not applicable"),
        sku: z.string().describe("SKU filter, or empty string if not applicable"),
        category: z.string().describe("Category filter, or empty string if not applicable"),
        status: z.string().describe("Status filter: in_stock, low_stock, out_of_stock, ordered, discontinued, or empty string if not applicable"),
        location: z.string().describe("Location filter, or empty string if not applicable"),
        interpretation: z.string(),
      }),
      system: "You are a search interpreter for an inventory management system. Extract structured filters from natural language queries. Always provide a human-readable interpretation. Use empty string for filters that don't apply.",
      prompt: `Interpret this inventory search query: "${query}"`,
    });

    let dbQuery = supabase.from("inventory_items").select("*, category:categories(name), supplier:suppliers(name)");
    if (filters.name) dbQuery = dbQuery.ilike("name", `%${filters.name}%`);
    if (filters.sku) dbQuery = dbQuery.ilike("sku", `%${filters.sku}%`);
    if (filters.status) dbQuery = dbQuery.eq("status", filters.status);
    if (filters.location) dbQuery = dbQuery.ilike("location", `%${filters.location}%`);

    const { data: items } = await dbQuery.limit(20);
    return Response.json({ interpretation: filters.interpretation, filters, items: items || [] });
  } catch (error: any) {
    console.error("AI Search error:", error);
    return Response.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
