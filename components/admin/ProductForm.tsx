"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertProductAction, deleteProductAction } from "@/app/actions/admin-products";

interface Initial {
  id?: string;
  slug: string;
  nameI18n: { en: string; it: string };
  descriptionI18n: { en: string; it: string };
  priceCents: number;
  currency: string;
  stock: number;
  isActive: boolean;
  weightGrams: number | null;
  images: Array<{ url: string; alt: string }>;
  defaultVariantSku: string;
}

const empty: Initial = {
  slug: "",
  nameI18n: { en: "", it: "" },
  descriptionI18n: { en: "", it: "" },
  priceCents: 0,
  currency: "EUR",
  stock: 0,
  isActive: true,
  weightGrams: null,
  images: [],
  defaultVariantSku: "",
};

export function ProductForm({ initial }: { initial?: Initial }) {
  const v = initial ?? empty;
  const [images, setImages] = useState<Array<{ url: string; alt: string }>>(v.images ?? []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("prefix", "products");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      setImages((cur) => [...cur, { url, alt: file.name }]);
    } catch (e) {
      alert("Upload fallito: " + ((e as Error).message ?? "errore sconosciuto"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form action={upsertProductAction} className="space-y-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      <Row label="Slug (URL)">
        <Input name="slug" defaultValue={v.slug} required pattern="[a-z0-9-]+" placeholder="es. revoring-medium" />
      </Row>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="Nome (italiano)">
          <Input name="name_it" defaultValue={v.nameI18n.it} required />
        </Row>
        <Row label="Nome (inglese)">
          <Input name="name_en" defaultValue={v.nameI18n.en} required />
        </Row>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="Descrizione (italiano)">
          <textarea
            name="description_it"
            defaultValue={v.descriptionI18n.it}
            required
            className="w-full min-h-32 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </Row>
        <Row label="Descrizione (inglese)">
          <textarea
            name="description_en"
            defaultValue={v.descriptionI18n.en}
            required
            className="w-full min-h-32 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </Row>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Row label="Prezzo (centesimi)">
          <Input name="priceCents" type="number" min="0" defaultValue={v.priceCents} required />
        </Row>
        <Row label="Valuta">
          <select
            name="currency"
            defaultValue={v.currency}
            className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </Row>
        <Row label="Scorte">
          <Input name="stock" type="number" min="0" defaultValue={v.stock} required />
        </Row>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="SKU variante predefinita">
          <Input name="defaultVariantSku" defaultValue={v.defaultVariantSku} required />
        </Row>
        <Row label="Peso (grammi)">
          <Input name="weightGrams" type="number" min="0" defaultValue={v.weightGrams ?? ""} />
        </Row>
      </div>

      <Row label="Visibilità">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={v.isActive} />
          <span className="text-sm">Mostra nel catalogo pubblico</span>
        </label>
      </Row>

      <Row label="Immagini">
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
            className="sr-only"
            id="product-image-input"
          />
          <label
            htmlFor="product-image-input"
            aria-disabled={uploading}
            className={`inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-800 ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? "Caricamento…" : "Scegli file"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={img.url} className="relative">
                <Image src={img.url} alt={img.alt} width={200} height={200} className="aspect-square object-cover rounded w-full h-auto" />
                <button
                  type="button"
                  onClick={() => setImages((cur) => cur.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 text-xs bg-white/90 rounded px-2 py-0.5"
                  aria-label="Rimuovi"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input type="hidden" name="images" value={JSON.stringify(images)} />
        </div>
      </Row>

      <div className="flex gap-3 pt-4">
        <Button type="submit">{v.id ? "Salva modifiche" : "Crea prodotto"}</Button>
        {v.id && <DeleteButton id={v.id} />}
      </div>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteProductAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        onClick={(e) => {
          if (!confirm("Eliminare definitivamente questo prodotto?")) e.preventDefault();
        }}
      >
        Elimina
      </Button>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
    </label>
  );
}
