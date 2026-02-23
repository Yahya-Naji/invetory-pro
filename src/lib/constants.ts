export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ITEM_STATUSES = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  ORDERED: "ordered",
  DISCONTINUED: "discontinued",
} as const;

export type ItemStatus = (typeof ITEM_STATUSES)[keyof typeof ITEM_STATUSES];

export const MOVEMENT_TYPES = {
  IN: "in",
  OUT: "out",
  ADJUSTMENT: "adjustment",
} as const;

export const CATEGORIES = [
  "Electronics",
  "Office Supplies",
  "Furniture",
  "Tools",
  "Safety Equipment",
  "Cleaning Supplies",
  "Raw Materials",
  "Packaging",
  "Food & Beverage",
  "Clothing",
  "Automotive",
  "Medical",
  "Other",
] as const;
