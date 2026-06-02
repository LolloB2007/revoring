import Link from "next/link";
import { store } from "@/lib/store";
import { TABLES, type Product } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const all = await store.all<Product>(TABLES.products);
  const products = all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Prodotti</h1>
          <p className="mt-1 text-sm text-neutral-600">{products.length} prodotti nel catalogo.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">+ Nuovo prodotto</Link>
        </Button>
      </div>
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Nome (IT)</th>
              <th className="px-4 py-3">Prezzo</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Attivo</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3">{p.nameI18n.it ?? p.nameI18n.en}</td>
                <td className="px-4 py-3">{formatPrice(p.priceCents, p.currency)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.isActive ? "●" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-xs underline">Modifica</Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Nessun prodotto ancora — clicca <em>Nuovo prodotto</em> per aggiungerne uno.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
