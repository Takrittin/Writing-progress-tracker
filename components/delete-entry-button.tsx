"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteEntryButton({ entryId, title }: { entryId: string; title: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${title}" from your history? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not delete this entry.");
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete this entry.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[hsl(var(--danger)/0.24)] bg-[hsl(var(--danger)/0.1)] px-4 text-sm font-semibold text-[hsl(var(--danger))] transition hover:bg-[hsl(var(--danger)/0.16)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete
      </button>
      {error ? <p className="text-xs leading-4 text-[hsl(var(--danger))]">{error}</p> : null}
    </div>
  );
}
