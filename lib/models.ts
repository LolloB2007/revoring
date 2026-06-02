/**
 * Plain TypeScript types for every "table" in the JSON store. These mirror
 * the Drizzle schema in db/schema.ts but live in TS land — no SQL types.
 */

export type Role = "user" | "admin";
export type OrderStatus = "pending" | "paid" | "fulfilled" | "refunded" | "cancelled";

export interface I18n {
  it: string;
  en: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  hashedPassword: string | null;
  role: Role;
  totpSecret: string | null;
  totpEnabled: boolean;
  backupCodes: string[] | null;
  failedLoginCount: number;
  lockedUntil: Date | null;
  createdAt: Date;
}

export interface Category {
  id: string;
  slug: string;
  nameI18n: I18n;
  coverUrl: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  nameI18n: I18n;
  descriptionI18n: I18n;
  priceCents: number;
  currency: string;
  images: Array<{ url: string; alt: string }>;
  categoryId: string | null;
  stock: number;
  isActive: boolean;
  weightGrams: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  attrs: Record<string, string>;
  priceCents: number | null;
  stock: number;
}

export interface Favorite {
  userId: string;
  productId: string;
  createdAt: Date;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  qty: number;
}

export interface Order {
  id: string;
  userId: string | null;
  email: string;
  stripePaymentIntent: string | null;
  stripeCheckoutSession: string | null;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  shippingAddress: Record<string, string> | null;
  billingAddress: Record<string, string> | null;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string | null;
  productSnapshot: unknown;
  unitPriceCents: number;
  qty: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleI18n: I18n;
  excerptI18n: I18n;
  bodyI18n: I18n;
  coverUrl: string | null;
  coverAlt: string | null;
  tags: string[];
  publishedAt: Date | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  key: "about" | "privacy" | "cookies" | "terms" | "contacts";
  bodyI18n: I18n;
  updatedAt: Date;
}

export interface UiTranslation {
  key: string;
  en: string;
  it: string;
  updatedAt: Date;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  locale: string;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  confirmationToken: string;
  createdAt: Date;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  locale: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export const TABLES = {
  users: "users",
  categories: "categories",
  products: "products",
  variants: "variants",
  favorites: "favorites",
  carts: "carts",
  cartItems: "cart_items",
  orders: "orders",
  orderItems: "order_items",
  blogPosts: "blog_posts",
  pages: "pages",
  uiTranslations: "ui_translations",
  newsletterSubscribers: "newsletter",
  contactSubmissions: "contacts",
  audit: "audit",
} as const;
