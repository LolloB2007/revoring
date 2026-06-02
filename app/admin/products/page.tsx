import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await db
    .select()
    .from(schema.products)
    .orderBy(desc(schema.products.createdAt));
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">+ New product</Link>
        </Button>
      </div>
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Name (EN)</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3">{p.nameI18n.en}</td>
                <td className="px-4 py-3">{formatPrice(p.priceCents, p.currency)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.isActive ? "●" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-xs underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  No products yet — click <em>New product</em> to add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
