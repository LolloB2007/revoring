"use client";

import { useState } from "react";
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

  async function upload(file: File) {
    const presign = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        byteSize: file.size,
        prefix: "products",
      }),
    });
    if (!presign.ok) return alert("Upload failed");
    const { url, publicUrl } = await presign.json();
    const put = await fetch(url, { method: "PUT", headers: { "content-type": file.type }, body: file });
    if (!put.ok) return alert("Upload failed");
    setImages((cur) => [...cur, { url: publicUrl, alt: file.name }]);
  }

  return (
    <form action={upsertProductAction} className="space-y-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      <Row label="Slug">
        <Input name="slug" defaultValue={v.slug} required pattern="[a-z0-9-]+" />
      </Row>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="Name (IT)">
          <Input name="name_it" defaultValue={v.nameI18n.it} required />
        </Row>
        <Row label="Name (EN)">
          <Input name="name_en" defaultValue={v.nameI18n.en} required />
        </Row>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="Description (IT)">
          <textarea
            name="description_it"
            defaultValue={v.descriptionI18n.it}
            required
            className="w-full min-h-32 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </Row>
        <Row label="Description (EN)">
          <textarea
            name="description_en"
            defaultValue={v.descriptionI18n.en}
            required
            className="w-full min-h-32 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </Row>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Row label="Price (cents)">
          <Input name="priceCents" type="number" min="0" defaultValue={v.priceCents} required />
        </Row>
        <Row label="Currency">
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
        <Row label="Stock">
          <Input name="stock" type="number" min="0" defaultValue={v.stock} required />
        </Row>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="Default variant SKU">
          <Input name="defaultVariantSku" defaultValue={v.defaultVariantSku} required />
        </Row>
        <Row label="Weight (grams)">
          <Input name="weightGrams" type="number" min="0" defaultValue={v.weightGrams ?? ""} />
        </Row>
      </div>

      <Row label="Active">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={v.isActive} />
          <span className="text-sm">Visible in catalogue</span>
        </label>
      </Row>

      <Row label="Images">
        <div className="space-y-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
            className="text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={img.url} className="relative">
                <img src={img.url} alt={img.alt} className="aspect-square object-cover rounded" />
                <button
                  type="button"
                  onClick={() => setImages((cur) => cur.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 text-xs bg-white/90 rounded px-2 py-0.5"
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
        <Button type="submit">{v.id ? "Save changes" : "Create product"}</Button>
        {v.id && (
          <DeleteButton id={v.id} />
        )}
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
          if (!confirm("Delete this product? This cannot be undone.")) e.preventDefault();
        }}
      >
        Delete
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
