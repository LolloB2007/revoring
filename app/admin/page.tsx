import Link from "next/link";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import { TABLES, type Product, type Order, type BlogPost, type NewsletterSubscriber, type ContactSubmission } from "@/lib/models";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await auth();

  const [products, orders, posts, subs, msgs] = await Promise.all([
    store.all<Product>(TABLES.products),
    store.all<Order>(TABLES.orders),
    store.all<BlogPost>(TABLES.blogPosts),
    store.findMany<NewsletterSubscriber>(TABLES.newsletterSubscribers, (s) => !!s.confirmedAt),
    store.all<ContactSubmission>(TABLES.contactSubmissions),
  ]);

  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
  const revenue = paidOrders.reduce((a, b) => a + b.totalCents, 0);
  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-neutral-600">
        Ciao{session?.user?.name ? `, ${session.user.name}` : ""}. Ecco un colpo d&apos;occhio sul tuo negozio.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="Ricavi (pagati)" value={formatPrice(revenue, "EUR")} href="/admin/orders" />
        <Stat label="Ordini totali" value={String(orders.length)} hint={`${paidOrders.length} pagati`} href="/admin/orders" />
        <Stat label="Prodotti attivi" value={String(products.filter((p) => p.isActive).length)} hint={`${products.length} totali`} href="/admin/products" />
        <Stat label="Iscritti newsletter" value={String(subs.length)} href="/admin/newsletter" />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card title="Ultimi ordini" href="/admin/orders" hrefLabel="Tutti gli ordini">
          {recentOrders.length === 0 ? (
            <Empty>Ancora nessun ordine.</Empty>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {recentOrders.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-mono text-xs text-neutral-500">#{o.id.slice(0, 8)}</p>
                    <p>{o.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(o.totalCents, o.currency)}</p>
                    <p className="text-xs text-neutral-500">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Contenuti" href="/admin/blog" hrefLabel="Tutti gli articoli">
          <ul className="divide-y divide-neutral-200">
            <Row label="Articoli pubblicati" value={posts.filter((p) => p.publishedAt).length} />
            <Row label="Bozze" value={posts.filter((p) => !p.publishedAt).length} />
            <Row label="Messaggi dal modulo contatti" value={msgs.length} />
          </ul>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Scorciatoie</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Quick href="/admin/products/new" title="Nuovo prodotto" body="Aggiungi un articolo al catalogo." />
          <Quick href="/admin/blog/new" title="Nuovo articolo" body="Scrivi un post sul blog Revoring." />
          <Quick href="/admin/categories" title="Categorie" body="Organizza il catalogo per categoria." />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const inner = (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-200 hover:border-neutral-400 transition">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Card({ title, children, href, hrefLabel }: { title: string; children: React.ReactNode; href?: string; hrefLabel?: string }) {
  return (
    <div className="rounded-lg bg-white border border-neutral-200 p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{title}</h3>
        {href && (
          <Link href={href} className="text-xs text-neutral-500 hover:text-neutral-900 underline-offset-4 hover:underline">
            {hrefLabel}
          </Link>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <li className="py-2 flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-500 py-4">{children}</p>;
}

function Quick({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-neutral-200 bg-white p-5 hover:border-neutral-400 hover:shadow-sm transition"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{body}</p>
    </Link>
  );
}
