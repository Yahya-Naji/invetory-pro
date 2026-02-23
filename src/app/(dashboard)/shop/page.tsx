"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/providers/cart-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Plus,
  Search,
  Package,
  Minus,
  MapPin,
  Tag,
  Truck,
  Box,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { InventoryItem, Category } from "@/types";
import Link from "next/link";

function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 ${className}`}>
        <Package className="h-10 w-10 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

export default function ShopPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { addItem, updateQuantity, items: cartItems, totalItems, totalPrice } = useCart();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase
          .from("inventory_items")
          .select("*, category:categories(*), supplier:suppliers(*)")
          .in("status", ["in_stock", "low_stock"])
          .gt("quantity", 0)
          .order("name");

        if (search) {
          query = query.ilike("name", `%${search}%`);
        }
        if (categoryFilter && categoryFilter !== "all") {
          query = query.eq("category_id", categoryFilter);
        }

        const [itemsRes, catRes] = await Promise.all([
          query,
          supabase.from("categories").select("*").order("name"),
        ]);

        setItems(itemsRes.data || []);
        setCategories(catRes.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [search, categoryFilter]);

  const getCartQuantity = (itemId: string) => {
    return cartItems.find((ci) => ci.item.id === itemId)?.quantity || 0;
  };

  // Group items by category
  const groupedItems = items.reduce<Record<string, { category: Category | null; items: InventoryItem[] }>>((acc, item) => {
    const catName = item.category?.name || "Other";
    if (!acc[catName]) {
      acc[catName] = { category: item.category || null, items: [] };
    }
    acc[catName].items.push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedItems).sort();

  const handleAdd = (item: InventoryItem) => {
    addItem(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader title="Shop" description="Browse items and add to your cart." />
        <Link href="/my-orders">
          <Button variant="outline" className="relative gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {totalItems > 0 && (
              <Badge className="ml-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                {totalItems}
              </Badge>
            )}
            {totalPrice > 0 && (
              <span className="text-xs text-muted-foreground">${totalPrice.toFixed(2)}</span>
            )}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-square w-full rounded-t-xl" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium">No items found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : categoryFilter !== "all" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <ProductCard key={item.id} item={item} index={index} inCart={getCartQuantity(item.id)} onAdd={handleAdd} onUpdate={updateQuantity} onSelect={setSelectedItem} />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {sortedCategories.map((catName) => {
            const group = groupedItems[catName];
            return (
              <section key={catName}>
                <div className="mb-4 flex items-center gap-3">
                  {group.category?.image_url ? (
                    <div className="h-10 w-10 overflow-hidden rounded-lg shrink-0">
                      <img src={group.category.image_url} alt={catName} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 shrink-0">
                      <Tag className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{catName}</h2>
                    <p className="text-xs text-muted-foreground">{group.items.length} item{group.items.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.items.map((item, index) => (
                    <ProductCard key={item.id} item={item} index={index} inCart={getCartQuantity(item.id)} onAdd={handleAdd} onUpdate={updateQuantity} onSelect={setSelectedItem} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        inCart={selectedItem ? getCartQuantity(selectedItem.id) : 0}
        onAdd={handleAdd}
        onUpdate={updateQuantity}
      />
    </div>
  );
}

function ProductCard({
  item,
  index,
  inCart,
  onAdd,
  onUpdate,
  onSelect,
}: {
  item: InventoryItem;
  index: number;
  inCart: number;
  onAdd: (item: InventoryItem) => void;
  onUpdate: (itemId: string, quantity: number) => void;
  onSelect: (item: InventoryItem) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <div
          className="relative aspect-square cursor-pointer overflow-hidden bg-slate-100"
          onClick={() => onSelect(item)}
        >
          <ProductImage
            src={item.image_url}
            alt={item.name}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {item.status === "low_stock" && (
            <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700 border-amber-200 text-xs">
              Low Stock
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col p-4">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
            {item.category && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.category.name}</p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-indigo-600">${(item.unit_price || 0).toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">{item.quantity} left</span>
          </div>
          <div className="mt-3">
            {inCart > 0 ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => onUpdate(item.id, inCart - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="flex-1 text-center text-sm font-medium">{inCart} in cart</span>
                <Button size="sm" className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700" onClick={() => onAdd(item)} disabled={inCart >= item.quantity}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => onAdd(item)}>
                <Plus className="mr-1 h-3 w-3" />
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProductDetailDialog({
  item,
  open,
  onClose,
  inCart,
  onAdd,
  onUpdate,
}: {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
  inCart: number;
  onAdd: (item: InventoryItem) => void;
  onUpdate: (itemId: string, quantity: number) => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-slate-100 md:aspect-auto md:min-h-[400px]">
            <ProductImage src={item.image_url} alt={item.name} />
            {item.status === "low_stock" && (
              <Badge className="absolute top-3 left-3 bg-amber-100 text-amber-700 border-amber-200">
                Low Stock
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col p-6">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-2 mb-1">
                {item.category && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {item.category.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">SKU: {item.sku}</span>
              </div>
              <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
            </DialogHeader>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-indigo-600">
                ${(item.unit_price || 0).toFixed(2)}
              </span>
            </div>

            {item.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            )}

            <Separator className="my-4" />

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Box className="h-4 w-4 shrink-0" />
                <span>
                  <strong className="text-foreground">{item.quantity}</strong> in stock
                </span>
              </div>
              {item.location && (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{item.location}</span>
                </div>
              )}
              {item.supplier && (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span>{item.supplier.name}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              {inCart > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10"
                      onClick={() => onUpdate(item.id, inCart - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="flex-1 text-center text-lg font-semibold">
                      {inCart} in cart
                    </span>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => onAdd(item)}
                      disabled={inCart >= item.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Subtotal: <strong className="text-foreground">${((item.unit_price || 0) * inCart).toFixed(2)}</strong>
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => onAdd(item)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
