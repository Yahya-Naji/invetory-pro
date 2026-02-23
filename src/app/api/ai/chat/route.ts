import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { streamText, convertToModelMessages } from "ai";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { messages } = await request.json();

    const { count: totalItems } = await supabase.from("inventory_items").select("*", { count: "exact", head: true });
    const { count: lowStock } = await supabase.from("inventory_items").select("*", { count: "exact", head: true }).in("status", ["low_stock", "out_of_stock"]);

    const result = streamText({
      model: openai("gpt-4o"),
      system: `You are an AI inventory management assistant for "Inventory Pro". Help users with:
- Finding items and checking stock levels
- Understanding inventory trends and patterns
- Answering questions about suppliers and categories
- Providing inventory management best practices
- Helping shoppers find products they need

Current stats: ${totalItems} total items, ${lowStock} items low/out of stock.
Be concise, helpful, and friendly. Use bullet points and short paragraphs.`,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return new Response(JSON.stringify({ error: error.message || "AI chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
