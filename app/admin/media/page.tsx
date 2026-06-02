import Image from "next/image";
import { store } from "@/lib/store";
import { TABLES, type Product, type BlogPost } from "@/lib/models";
import { env } from "@/lib/env";

interface MediaItem {
  url: string;
  alt: string;
  source: string;
  ref: string;
}

export default async function AdminMediaPage() {
  const [products, posts] = await Promise.all([
    store.all<Product>(TABLES.products),
    store.all<BlogPost>(TABLES.blogPosts),
  ]);

  const items: MediaItem[] = [];
  for (const p of products) {
    for (const img of p.images) {
      items.push({ url: img.url, alt: img.alt, source: "Prodotto", ref: p.nameI18n.it ?? p.slug });
    }
  }
  for (const post of posts) {
    if (post.coverUrl) {
      items.push({
        url: post.coverUrl,
        alt: post.coverAlt ?? post.titleI18n.it,
        source: "Articolo",
        ref: post.titleI18n.it,
      });
    }
  }
  // Dedupe by URL.
  const dedup: MediaItem[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    if (!seen.has(it.url)) {
      seen.add(it.url);
      dedup.push(it);
    }
  }

  const r2Ready = !!env.R2_ACCESS_KEY_ID && !!env.R2_BUCKET && !!env.R2_PUBLIC_HOST;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Media</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Immagini in uso su prodotti e articoli. Per caricare nuovi file usa il pulsante <em>Immagini</em> nei form di prodotto e blog.
      </p>

      {!r2Ready && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Cloudflare R2 non configurato.</p>
          <p className="mt-1">
            Imposta <code>R2_ACCOUNT_ID</code>, <code>R2_ACCESS_KEY_ID</code>, <code>R2_SECRET_ACCESS_KEY</code>,
            {" "}<code>R2_BUCKET</code> e <code>R2_PUBLIC_HOST</code> in <code>.env.local</code> per abilitare l&apos;upload diretto. Senza R2 puoi
            ancora incollare URL pubblici (es. dal vecchio sito) nei form.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {dedup.map((m) => (
          <div key={m.url} className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="relative aspect-square bg-neutral-100">
              <Image src={m.url} alt={m.alt} fill sizes="25vw" className="object-cover" />
            </div>
            <div className="p-3 text-xs">
              <p className="text-neutral-500">{m.source}</p>
              <p className="mt-0.5 font-medium truncate" title={m.ref}>{m.ref}</p>
              <p className="mt-1 text-neutral-400 truncate" title={m.url}>{m.url}</p>
            </div>
          </div>
        ))}
        {dedup.length === 0 && (
          <p className="col-span-full text-neutral-500 py-8 text-center">
            Ancora nessuna immagine. Caricale aggiungendo prodotti o articoli.
          </p>
        )}
      </div>
    </div>
  );
}
