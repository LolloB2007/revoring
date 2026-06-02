import { store } from "@/lib/store";
import { TABLES, type NewsletterSubscriber } from "@/lib/models";
import { NewsletterComposer } from "@/components/admin/NewsletterComposer";

export default async function AdminNewsletterPage() {
  const all = await store.findMany<NewsletterSubscriber>(
    TABLES.newsletterSubscribers,
    (s) => !!s.confirmedAt && !s.unsubscribedAt,
  );
  const confirmed = all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 500);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Newsletter</h1>
      <p className="mt-2 text-sm text-neutral-600">{confirmed.length} iscritti confermati.</p>
      <div className="mt-8">
        <NewsletterComposer subscriberCount={confirmed.length} />
      </div>
      <div className="mt-12">
        <h2 className="text-xl font-semibold">Iscritti</h2>
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Lingua</th>
                <th className="px-4 py-3">Confermato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {confirmed.map((s) => (
                <tr key={s.email}>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.locale}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {s.confirmedAt ? new Date(s.confirmedAt).toLocaleDateString("it-IT") : ""}
                  </td>
                </tr>
              ))}
              {confirmed.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                    Nessun iscritto ancora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
