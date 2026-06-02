"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendBroadcastAction } from "@/app/actions/admin-newsletter";
import { RichTextEditor } from "./RichTextEditor";

export function NewsletterComposer({ subscriberCount }: { subscriberCount: number }) {
  const [subjectIt, setSubjectIt] = useState("");
  const [subjectEn, setSubjectEn] = useState("");
  const [bodyIt, setBodyIt] = useState("<p></p>");
  const [bodyEn, setBodyEn] = useState("<p></p>");
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm(`Send this broadcast to ${subscriberCount} subscribers?`)) return;
        const fd = new FormData();
        fd.set("subject_it", subjectIt);
        fd.set("subject_en", subjectEn);
        fd.set("body_it", bodyIt);
        fd.set("body_en", bodyEn);
        startTransition(async () => {
          const r = await sendBroadcastAction(fd);
          setResult(`Sent ${r.sent}, failed ${r.failed}`);
        });
      }}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Subject (IT)</span>
          <Input value={subjectIt} onChange={(e) => setSubjectIt(e.target.value)} required />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1">Subject (EN)</span>
          <Input value={subjectEn} onChange={(e) => setSubjectEn(e.target.value)} required />
        </label>
      </div>
      <div>
        <p className="text-sm font-medium mb-1">Body (IT)</p>
        <RichTextEditor value={bodyIt} onChange={setBodyIt} />
      </div>
      <div>
        <p className="text-sm font-medium mb-1">Body (EN)</p>
        <RichTextEditor value={bodyEn} onChange={setBodyEn} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Sending…" : `Send to ${subscriberCount}`}</Button>
      {result && <p className="text-sm text-neutral-600">{result}</p>}
    </form>
  );
}
