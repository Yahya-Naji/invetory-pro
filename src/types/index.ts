export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "manager" | "viewer";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  category_id: string | null;
  description: string | null;
  image_url: string | null;
  unit_price: number | null;
  supplier_id: string | null;
  location: string | null;
  reorder_level: number;
  barcode: string | null;
  status: "in_stock" | "low_stock" | "out_of_stock" | "ordered" | "discontinued";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  supplier?: Supplier;
}

export interface StockMovement {
  id: string;
  item_id: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string | null;
  notes: string | null;
  performed_by: string | null;
  created_at: string;
  item?: InventoryItem;
  performer?: Profile;
}

export interface Alert {
  id: string;
  item_id: string;
  type: "low_stock" | "out_of_stock" | "overstock";
  message: string;
  is_read: boolean;
  created_at: string;
  item?: InventoryItem;
}

export interface Order {
  id: string;
  customer_id: string;
  status: "pending" | "approved" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  item?: InventoryItem;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}
