import path from "node:path";
import { promises as fs } from "node:fs";
import { store } from "@/lib/store";
import { TABLES, type UiTranslation } from "@/lib/models";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveTranslationAction } from "@/app/actions/admin-translations";

async function loadFileMessages(): Promise<Record<string, { it: string; en: string }>> {
  const root = process.cwd();
  const itRaw = await fs.readFile(path.join(root, "messages/it.json"), "utf8");
  const enRaw = await fs.readFile(path.join(root, "messages/en.json"), "utf8");
  const it = flatten(JSON.parse(itRaw));
  const en = flatten(JSON.parse(enRaw));
  const keys = new Set<string>([...Object.keys(it), ...Object.keys(en)]);
  const out: Record<string, { it: string; en: string }> = {};
  for (const k of [...keys].sort()) out[k] = { it: it[k] ?? "", en: en[k] ?? "" };
  return out;
}

function flatten(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof obj !== "object" || obj === null) return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else if (typeof v === "object" && v !== null) Object.assign(out, flatten(v, key));
  }
  return out;
}

export default async function AdminTranslationsPage() {
  let file: Record<string, { it: string; en: string }> = {};
  try {
    file = await loadFileMessages();
  } catch {
    /* messages files not readable */
  }
  const overrides = await store.all<UiTranslation>(TABLES.uiTranslations);
  const overrideMap = new Map(overrides.map((o) => [o.key, o]));

  const rows = Object.entries(file).map(([key, base]) => {
    const ov = overrideMap.get(key);
    return {
      key,
      it: ov?.it ?? base.it,
      en: ov?.en ?? base.en,
      isOverridden: !!ov,
    };
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Traduzioni</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Tutte le stringhe statiche dell&apos;interfaccia, italiano e inglese. I valori base arrivano da{" "}
        <code>messages/it.json</code> e <code>messages/en.json</code>; salvando qui crei un override
        persistente nel JSON store che ha priorità.
      </p>

      <div className="mt-8 space-y-4">
        {rows.map((r) => (
          <form
            key={r.key}
            action={saveTranslationAction}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <input type="hidden" name="key" value={r.key} />
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-xs text-neutral-500">{r.key}</p>
              {r.isOverridden && (
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Modificato
                </span>
              )}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="block text-xs text-neutral-500 mb-1">IT</span>
                <Input name="it" defaultValue={r.it} />
              </label>
              <label className="block">
                <span className="block text-xs text-neutral-500 mb-1">EN</span>
                <Input name="en" defaultValue={r.en} />
              </label>
            </div>
            <div className="mt-3 text-right">
              <Button type="submit" size="sm">Salva</Button>
            </div>
          </form>
        ))}
        {rows.length === 0 && (
          <p className="text-neutral-500">Nessuna stringa trovata in <code>messages/</code>.</p>
        )}
      </div>
    </div>
  );
}
