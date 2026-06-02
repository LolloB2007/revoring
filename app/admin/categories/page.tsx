import { store } from "@/lib/store";
import { TABLES, type Category } from "@/lib/models";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertCategoryAction, deleteCategoryAction } from "@/app/actions/admin-categories";

export default async function AdminCategoriesPage() {
  const all = await store.all<Category>(TABLES.categories);
  const categories = all.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Categorie</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Organizza il catalogo. Lo slug è la parte di URL: <code>/catalogue?cat=&lt;slug&gt;</code>.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Esistenti</h2>
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Ordine</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Nome (IT)</th>
                <th className="px-4 py-3">Nome (EN)</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-xs">{c.sortOrder}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3">{c.nameI18n.it}</td>
                  <td className="px-4 py-3">{c.nameI18n.en}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteCategoryAction} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-xs text-red-600 underline">Elimina</button>
                    </form>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    Nessuna categoria ancora. Aggiungine una qui sotto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Nuova categoria</h2>
        <form action={upsertCategoryAction} className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Slug</span>
              <Input name="slug" required pattern="[a-z0-9-]+" placeholder="es. allenamento-funzionale" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Ordine</span>
              <Input name="sortOrder" type="number" min="0" defaultValue={0} />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Nome (italiano)</span>
              <Input name="name_it" required />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Nome (inglese)</span>
              <Input name="name_en" required />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium mb-1">URL immagine di copertina (opzionale)</span>
            <Input name="coverUrl" type="url" placeholder="https://..." />
          </label>
          <Button type="submit">Crea categoria</Button>
        </form>
      </section>
    </div>
  );
}
