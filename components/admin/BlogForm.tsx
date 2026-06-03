"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertPostAction, deletePostAction } from "@/app/actions/admin-blog";
import { RichTextEditor } from "./RichTextEditor";

interface Initial {
  id?: string;
  slug: string;
  titleI18n: { en: string; it: string };
  excerptI18n: { en: string; it: string };
  bodyI18n: { en: string; it: string };
  coverUrl: string | null;
  coverAlt: string | null;
  tags: string[];
  published: boolean;
}

const empty: Initial = {
  slug: "",
  titleI18n: { en: "", it: "" },
  excerptI18n: { en: "", it: "" },
  bodyI18n: { en: "<p></p>", it: "<p></p>" },
  coverUrl: null,
  coverAlt: null,
  tags: [],
  published: false,
};

export function BlogForm({ initial }: { initial?: Initial }) {
  const v = initial ?? empty;
  const [bodyEn, setBodyEn] = useState(v.bodyI18n.en);
  const [bodyIt, setBodyIt] = useState(v.bodyI18n.it);
  const [coverUrl, setCoverUrl] = useState<string | null>(v.coverUrl);

  async function uploadCover(file: File) {
    try {
      const { upload: blobUpload } = await import("@vercel/blob/client");
      const blob = await blobUpload(`blog/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: file.type,
      });
      setCoverUrl(blob.url);
    } catch (e) {
      alert("Upload fallito: " + ((e as Error).message ?? "errore sconosciuto"));
    }
  }

  return (
    <form action={upsertPostAction} className="space-y-6">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <input type="hidden" name="coverUrl" value={coverUrl ?? ""} />
      <input type="hidden" name="body_en" value={bodyEn} />
      <input type="hidden" name="body_it" value={bodyIt} />

      <Row label="Slug">
        <Input name="slug" defaultValue={v.slug} required pattern="[a-z0-9-]+" />
      </Row>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="Title (IT)">
          <Input name="title_it" defaultValue={v.titleI18n.it} required />
        </Row>
        <Row label="Title (EN)">
          <Input name="title_en" defaultValue={v.titleI18n.en} required />
        </Row>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Row label="Excerpt (IT)">
          <textarea
            name="excerpt_it"
            defaultValue={v.excerptI18n.it}
            required
            className="w-full min-h-20 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </Row>
        <Row label="Excerpt (EN)">
          <textarea
            name="excerpt_en"
            defaultValue={v.excerptI18n.en}
            required
            className="w-full min-h-20 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </Row>
      </div>

      <Row label="Cover image">
        <div className="space-y-2">
          {coverUrl && <img src={coverUrl} alt="" className="max-h-48 rounded" />}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadCover(f);
            }}
            className="text-sm"
          />
          <Input name="coverAlt" defaultValue={v.coverAlt ?? ""} placeholder="Alt text (required for SEO)" />
        </div>
      </Row>

      <Row label="Body (IT)">
        <RichTextEditor value={bodyIt} onChange={setBodyIt} />
      </Row>
      <Row label="Body (EN)">
        <RichTextEditor value={bodyEn} onChange={setBodyEn} />
      </Row>

      <Row label="Tags (comma-separated)">
        <Input name="tags" defaultValue={v.tags.join(", ")} />
      </Row>

      <Row label="Publish">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="publish" defaultChecked={v.published} />
          <span className="text-sm">Make this post live</span>
        </label>
      </Row>

      <div className="flex gap-3 pt-4">
        <Button type="submit">{v.id ? "Save" : "Create post"}</Button>
        {v.id && <DeleteButton id={v.id} />}
      </div>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deletePostAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        onClick={(e) => {
          if (!confirm("Delete this post?")) e.preventDefault();
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
