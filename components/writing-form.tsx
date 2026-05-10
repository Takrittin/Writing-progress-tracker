"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { countWords } from "@/lib/utils";

export function WritingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const wordCount = useMemo(() => countWords(text), [text]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/analyze-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, original_text: text })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not analyze writing.");
      }

      router.push(`/entries/${payload.entry_id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not analyze writing.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-[728px] gap-7 md:pt-1">
      <div>
        <label className="mb-2 block text-[18px] font-semibold" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
          maxLength={120}
          className="focus-ring liquid-input h-[60px] w-full rounded-full px-5 text-[21px] outline-none transition placeholder:text-[hsl(var(--muted)/0.5)]"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="text-[18px] font-semibold" htmlFor="original_text">
            Original Writing
          </label>
          {text ? (
            <span className="rounded-full bg-white/54 px-3 py-1 text-xs font-medium text-[hsl(var(--muted))] shadow-[inset_0_1px_0_white]">
              {wordCount} words
            </span>
          ) : null}
        </div>
        <textarea
          id="original_text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Start typing your draft... We're here to help you improve!"
          required
          minLength={10}
          maxLength={12000}
          rows={16}
          className="focus-ring liquid-textarea h-[278px] w-full resize-y rounded-2xl px-5 py-5 text-[17px] leading-7 outline-none transition placeholder:text-[hsl(var(--muted)/0.75)]"
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-[hsl(var(--danger)/0.28)] bg-[hsl(var(--danger)/0.1)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="focus-ring primary-gradient inline-flex h-12 min-w-[252px] items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isPending ? "Analyzing" : "Analyze Writing"}
        </button>
        <p className="text-center text-[16px] text-[hsl(var(--muted))]">
          Let&apos;s refine your work! Analysis saves automatically.
        </p>
      </div>
    </form>
  );
}
