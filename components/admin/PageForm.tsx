"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { savePageAction } from "@/app/actions/admin-pages";
import { RichTextEditor } from "./RichTextEditor";

export function PageForm({
  pageKey,
  initial,
}: {
  pageKey: string;
  initial: { en: string; it: string };
}) {
  const [it, setIt] = useState(initial.it);
  const [en, setEn] = useState(initial.en);
  return (
    <form action={savePageAction} className="space-y-6">
      <input type="hidden" name="key" value={pageKey} />
      <input type="hidden" name="body_it" value={it} />
      <input type="hidden" name="body_en" value={en} />
      <div>
        <p className="text-sm font-medium mb-1">Italian</p>
        <RichTextEditor value={it} onChange={setIt} />
      </div>
      <div>
        <p className="text-sm font-medium mb-1">English</p>
        <RichTextEditor value={en} onChange={setEn} />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
