import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { TABLES, type Page } from "@/lib/models";
import { PageForm } from "@/components/admin/PageForm";

const VALID = ["about", "privacy", "cookies", "terms", "contacts"] as const;
type Key = (typeof VALID)[number];

export default async function EditPagePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!VALID.includes(key as Key)) notFound();
  const row = await store.findOne<Page>(TABLES.pages, (p) => p.key === (key as Key));
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">{key}</h1>
      <div className="mt-8">
        <PageForm
          pageKey={key as Key}
          initial={row?.bodyI18n ?? { en: "<p></p>", it: "<p></p>" }}
        />
      </div>
    </div>
  );
}
