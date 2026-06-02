import { store } from "@/lib/store";
import { TABLES, type Order } from "@/lib/models";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  paid: "Pagato",
  fulfilled: "Spedito",
  refunded: "Rimborsato",
  cancelled: "Annullato",
};

export default async function AdminOrdersPage() {
  const all = await store.all<Order>(TABLES.orders);
  const orders = all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 200);
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Ordini</h1>
      <p className="mt-1 text-sm text-neutral-600">{orders.length} ordini più recenti.</p>
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Ordine</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Totale</th>
              <th className="px-4 py-3">Stato</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{o.email}</td>
                <td className="px-4 py-3">{formatPrice(o.totalCents, o.currency)}</td>
                <td className="px-4 py-3">{STATUS_LABEL[o.status] ?? o.status}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(o.createdAt).toLocaleDateString("it-IT")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Ancora nessun ordine.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
