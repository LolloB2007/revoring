import { store } from "@/lib/store";
import { TABLES, type AuditEntry } from "@/lib/models";

export default async function AuditPage() {
  const all = await store.all<AuditEntry>(TABLES.audit);
  const rows = all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 200);
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Registro attività</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Storico immutabile di ogni azione amministrativa. Ultime 200 voci.
      </p>
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Utente</th>
              <th className="px-4 py-3">Azione</th>
              <th className="px-4 py-3">Entità</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                  {new Date(r.createdAt).toISOString().slice(0, 19).replace("T", " ")}
                </td>
                <td className="px-4 py-3">{r.actorEmail}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.action}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {r.entityType}
                  {r.entityId ? `:${r.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{r.ip}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Nessuna azione registrata ancora.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
