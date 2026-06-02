import Link from "next/link";

const KEYS: Array<{ key: "about" | "privacy" | "cookies" | "terms" | "contacts"; label: string }> = [
  { key: "about", label: "About" },
  { key: "privacy", label: "Privacy policy" },
  { key: "cookies", label: "Cookie policy" },
  { key: "terms", label: "Terms of sale" },
  { key: "contacts", label: "Contacts (intro copy)" },
];

export default function AdminPagesPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Pages</h1>
      <p className="mt-2 text-sm text-neutral-600">Edit static page copy in both Italian and English. Sanitised HTML, supports headings/lists/links.</p>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {KEYS.map((k) => (
          <li key={k.key}>
            <Link
              href={`/admin/pages/${k.key}`}
              className="block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
            >
              <p className="font-medium">{k.label}</p>
              <p className="text-xs text-neutral-500">/admin/pages/{k.key}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
