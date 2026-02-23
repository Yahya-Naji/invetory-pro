import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { items, notes } = await request.json();

  if (!items || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Use admin client to bypass RLS for order creation
  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate items and calculate total
  let totalAmount = 0;
  const validatedItems: { item_id: string; quantity: number; unit_price: number; total_price: number }[] = [];

  for (const cartItem of items) {
    const { data: dbItem } = await supabase
      .from("inventory_items")
      .select("id, name, quantity, unit_price, status")
      .eq("id", cartItem.item_id)
      .single();

    if (!dbItem) {
      return Response.json({ error: `Item not found: ${cartItem.item_id}` }, { status: 400 });
    }

    if (dbItem.quantity < cartItem.quantity) {
      return Response.json(
        { error: `Not enough stock for "${dbItem.name}". Available: ${dbItem.quantity}` },
        { status: 400 }
      );
    }

    const unitPrice = dbItem.unit_price || 0;
    const totalPrice = unitPrice * cartItem.quantity;
    totalAmount += totalPrice;

    validatedItems.push({
      item_id: dbItem.id,
      quantity: cartItem.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    });
  }

  // Create order
  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      customer_id: user.id,
      total_amount: totalAmount,
      notes: notes || null,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Create order items
  const orderItems = validatedItems.map((vi) => ({
    order_id: order.id,
    ...vi,
  }));

  const { error: itemsError } = await adminSupabase.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error("Order items error:", itemsError);
    // Cleanup the order
    await adminSupabase.from("orders").delete().eq("id", order.id);
    return Response.json({ error: "Failed to create order items" }, { status: 500 });
  }

  // Update inventory quantities and create stock movements
  for (const vi of validatedItems) {
    const { data: currentItem } = await adminSupabase
      .from("inventory_items")
      .select("quantity, reorder_level")
      .eq("id", vi.item_id)
      .single();

    if (currentItem) {
      const newQuantity = currentItem.quantity - vi.quantity;
      let newStatus = "in_stock";
      if (newQuantity <= 0) newStatus = "out_of_stock";
      else if (newQuantity <= currentItem.reorder_level) newStatus = "low_stock";

      await adminSupabase
        .from("inventory_items")
        .update({ quantity: newQuantity, status: newStatus })
        .eq("id", vi.item_id);

      await adminSupabase.from("stock_movements").insert({
        item_id: vi.item_id,
        type: "out",
        quantity: vi.quantity,
        reason: "Customer order",
        notes: `Order #${order.id.slice(0, 8)}`,
        performed_by: user.id,
      });
    }
  }

  return Response.json({
    success: true,
    message: `Order placed successfully! Total: $${totalAmount.toFixed(2)}`,
    orderId: order.id,
  });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const allOrders = searchParams.get("all") === "true";

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("orders")
    .select("*, customer:profiles(full_name, email), order_items(*, item:inventory_items(name, sku, image_url))")
    .order("created_at", { ascending: false });

  if (!allOrders || !profile || profile.role === "viewer") {
    query = query.eq("customer_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  return Response.json(data || []);
}
