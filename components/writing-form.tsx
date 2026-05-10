"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnalysisJob, WRITING_DRAFT_STORAGE_KEY } from "@/components/analysis-job-provider";
import { countWords } from "@/lib/utils";

export function WritingForm() {
  const { isAnalyzing, startAnalysis } = useAnalysisJob();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const isMountedRef = useRef(false);
  const wordCount = useMemo(() => countWords(text), [text]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let savedTitle = "";
    let savedText = "";

    try {
      const savedDraft = window.localStorage.getItem(WRITING_DRAFT_STORAGE_KEY);

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as { title?: unknown; text?: unknown };

        if (typeof parsed.title === "string") {
          savedTitle = parsed.title;
        }

        if (typeof parsed.text === "string") {
          savedText = parsed.text;
        }
      }
    } catch {
      try {
        window.localStorage.removeItem(WRITING_DRAFT_STORAGE_KEY);
      } catch {
        // Local storage can be blocked; ignore and let the form continue.
      }
    }

    const timeout = window.setTimeout(() => {
      const currentTitle = document.getElementById("title");
      const currentText = document.getElementById("original_text");
      const titleValue = currentTitle instanceof HTMLInputElement ? currentTitle.value : "";
      const textValue = currentText instanceof HTMLTextAreaElement ? currentText.value : "";

      setTitle(titleValue || savedTitle);
      setText(textValue || savedText);
      setHasLoadedDraft(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) {
      return;
    }

    try {
      if (title.trim() || text.trim()) {
        window.localStorage.setItem(WRITING_DRAFT_STORAGE_KEY, JSON.stringify({ title, text }));
      } else {
        window.localStorage.removeItem(WRITING_DRAFT_STORAGE_KEY);
      }
    } catch {
      // Draft persistence is a convenience; the form still works if storage is blocked.
    }
  }, [hasLoadedDraft, text, title]);

  async function submitAnalysis() {
    setError(null);

    const result = await startAnalysis({ title, originalText: text });

    if (!result.ok && isMountedRef.current) {
      setError(result.error);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitAnalysis();
  }

  function handleAnalyzeClick() {
    const form = document.getElementById("writing-form");

    if (form instanceof HTMLFormElement && !form.reportValidity()) {
      return;
    }

    void submitAnalysis();
  }

  return (
    <form
      id="writing-form"
      data-ready={hasLoadedDraft ? "true" : "false"}
      onSubmit={handleSubmit}
      className="mx-auto grid w-full max-w-[728px] gap-7 md:pt-1"
    >
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
          disabled={isAnalyzing}
          maxLength={120}
          className="focus-ring liquid-input h-[60px] w-full rounded-full px-5 text-[21px] outline-none transition placeholder:text-[hsl(var(--muted)/0.5)] disabled:cursor-not-allowed disabled:opacity-70"
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
          disabled={isAnalyzing}
          minLength={10}
          maxLength={12000}
          rows={16}
          className="focus-ring liquid-textarea h-[278px] w-full resize-y rounded-2xl px-5 py-5 text-[17px] leading-7 outline-none transition placeholder:text-[hsl(var(--muted)/0.75)] disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-[hsl(var(--danger)/0.28)] bg-[hsl(var(--danger)/0.1)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className="focus-ring primary-gradient inline-flex h-12 min-w-[252px] items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isAnalyzing ? "Analyzing" : "Analyze Writing"}
        </button>
        <p className="text-center text-[16px] text-[hsl(var(--muted))]">
          Let&apos;s refine your work! Analysis saves automatically.
        </p>
      </div>
    </form>
  );
}
