import Link from "next/link";
import { store } from "@/lib/store";
import { TABLES, type BlogPost } from "@/lib/models";
import { Button } from "@/components/ui/button";

export default async function AdminBlogPage() {
  const all = await store.all<BlogPost>(TABLES.blogPosts);
  const posts = all.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-neutral-600">{posts.length} articoli ({posts.filter((p) => p.publishedAt).length} pubblicati).</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">+ Nuovo articolo</Link>
        </Button>
      </div>
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Titolo (IT)</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Pubblicato</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">{p.titleI18n.it ?? p.titleI18n.en}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("it-IT") : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/blog/${p.id}`} className="text-xs underline">Modifica</Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  Ancora nessun articolo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
