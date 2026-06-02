import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Users / Auth                                                        */
/* ------------------------------------------------------------------ */

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { withTimezone: true }),
    name: text("name"),
    image: text("image"),
    hashedPassword: text("hashed_password"),
    role: roleEnum("role").notNull().default("user"),
    totpSecret: text("totp_secret"),
    totpEnabled: boolean("totp_enabled").notNull().default(false),
    backupCodes: jsonb("backup_codes").$type<string[]>(),
    failedLoginCount: integer("failed_login_count").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_lower_idx").on(t.email),
  }),
);

// NOTE: column names use snake_case TS keys to match @auth/drizzle-adapter's
// expected shape. Do not rename without checking adapter compatibility.
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  }),
);

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    nameI18n: jsonb("name_i18n").$type<{ en: string; it: string }>().notNull(),
    coverUrl: text("cover_url"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(t.slug),
  }),
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    nameI18n: jsonb("name_i18n").$type<{ en: string; it: string }>().notNull(),
    descriptionI18n: jsonb("description_i18n").$type<{ en: string; it: string }>().notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    images: jsonb("images").$type<Array<{ url: string; alt: string }>>().notNull().default([]),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    stock: integer("stock").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    weightGrams: integer("weight_grams"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(t.slug),
    activeIdx: index("products_active_idx").on(t.isActive),
  }),
);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  attrs: jsonb("attrs").$type<Record<string, string>>().notNull().default({}),
  priceCents: integer("price_cents"),
  stock: integer("stock").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* Cart / Orders / Favorites                                           */
/* ------------------------------------------------------------------ */

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.productId] }),
  }),
);

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  qty: integer("qty").notNull(),
});

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "fulfilled",
  "refunded",
  "cancelled",
]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  stripePaymentIntent: text("stripe_payment_intent"),
  stripeCheckoutSession: text("stripe_checkout_session"),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  shippingAddress: jsonb("shipping_address").$type<Record<string, string>>(),
  billingAddress: jsonb("billing_address").$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productSnapshot: jsonb("product_snapshot").notNull(), // name, sku, attrs at time of purchase
  unitPriceCents: integer("unit_price_cents").notNull(),
  qty: integer("qty").notNull(),
});

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    titleI18n: jsonb("title_i18n").$type<{ en: string; it: string }>().notNull(),
    excerptI18n: jsonb("excerpt_i18n").$type<{ en: string; it: string }>().notNull(),
    bodyI18n: jsonb("body_i18n").$type<{ en: string; it: string }>().notNull(),
    coverUrl: text("cover_url"),
    coverAlt: text("cover_alt"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("blog_posts_slug_idx").on(t.slug),
    publishedIdx: index("blog_posts_published_idx").on(t.publishedAt),
  }),
);

export const pages = pgTable("pages", {
  key: text("key").primaryKey(), // "about" | "privacy" | "cookies" | "terms" | "contacts"
  bodyI18n: jsonb("body_i18n").$type<{ en: string; it: string }>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const uiTranslations = pgTable("ui_translations", {
  key: text("key").primaryKey(),
  en: text("en").notNull(),
  it: text("it").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Newsletter / Contacts                                               */
/* ------------------------------------------------------------------ */

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    locale: text("locale").notNull().default("it"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    confirmationToken: text("confirmation_token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("newsletter_email_idx").on(t.email),
  }),
);

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  locale: text("locale").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Audit log                                                            */
/* ------------------------------------------------------------------ */

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorEmail: text("actor_email"),
    action: text("action").notNull(), // e.g. "product.update"
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    actorIdx: index("audit_log_actor_idx").on(t.actorId),
    createdIdx: index("audit_log_created_idx").on(t.createdAt),
  }),
);
