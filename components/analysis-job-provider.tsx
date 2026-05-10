"use client";

import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

export const WRITING_DRAFT_STORAGE_KEY = "writing-tracker:new-writing-draft";

type AnalysisInput = {
  title: string;
  originalText: string;
};

type AnalysisJob =
  | { status: "idle" }
  | { status: "pending"; title: string }
  | { status: "complete"; entryId: string; title: string }
  | { status: "error"; error: string; title: string };

type StartAnalysisResult =
  | { ok: true; entryId: string }
  | { ok: false; error: string };

type AnalysisJobContextValue = {
  clearJob: () => void;
  isAnalyzing: boolean;
  job: AnalysisJob;
  startAnalysis: (input: AnalysisInput) => Promise<StartAnalysisResult>;
};

const AnalysisJobContext = createContext<AnalysisJobContextValue | null>(null);

function getErrorMessage(caught: unknown) {
  return caught instanceof Error ? caught.message : "Could not analyze writing.";
}

function clearSavedDraft() {
  try {
    window.localStorage.removeItem(WRITING_DRAFT_STORAGE_KEY);
  } catch {
    // Local storage can be unavailable in private browsing or strict browser modes.
  }
}

export function AnalysisJobProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const isPendingRef = useRef(false);
  const requestIdRef = useRef(0);
  const [job, setJob] = useState<AnalysisJob>({ status: "idle" });
  const isAnalyzing = job.status === "pending";

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const clearJob = useCallback(() => {
    setJob({ status: "idle" });
  }, []);

  const startAnalysis = useCallback(
    async ({ title, originalText }: AnalysisInput): Promise<StartAnalysisResult> => {
      if (isPendingRef.current) {
        return { ok: false, error: "Your analysis is already running." };
      }

      const requestId = requestIdRef.current + 1;
      isPendingRef.current = true;
      requestIdRef.current = requestId;
      setJob({ status: "pending", title });

      try {
        const response = await fetch("/api/analyze-writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, original_text: originalText })
        });
        const payload = (await response.json()) as { entry_id?: unknown; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not analyze writing.");
        }

        if (typeof payload.entry_id !== "string") {
          throw new Error("The analysis finished, but no result id was returned.");
        }

        if (requestIdRef.current !== requestId) {
          return { ok: false, error: "A newer analysis has already started." };
        }

        clearSavedDraft();

        if (pathnameRef.current === "/new") {
          setJob({ status: "idle" });
          router.push(`/entries/${payload.entry_id}`);
          router.refresh();
        } else {
          setJob({ status: "complete", entryId: payload.entry_id, title });
        }

        return { ok: true, entryId: payload.entry_id };
      } catch (caught) {
        const error = getErrorMessage(caught);

        if (requestIdRef.current === requestId) {
          setJob({ status: "error", error, title });
        }

        return { ok: false, error };
      } finally {
        if (requestIdRef.current === requestId) {
          isPendingRef.current = false;
        }
      }
    },
    [router]
  );

  const value = useMemo(
    () => ({
      clearJob,
      isAnalyzing,
      job,
      startAnalysis
    }),
    [clearJob, isAnalyzing, job, startAnalysis]
  );

  return (
    <AnalysisJobContext.Provider value={value}>
      {children}
      <AnalysisJobBanner job={job} onDismiss={clearJob} />
    </AnalysisJobContext.Provider>
  );
}

export function useAnalysisJob() {
  const context = useContext(AnalysisJobContext);

  if (!context) {
    throw new Error("useAnalysisJob must be used inside AnalysisJobProvider.");
  }

  return context;
}

function AnalysisJobBanner({
  job,
  onDismiss
}: {
  job: AnalysisJob;
  onDismiss: () => void;
}) {
  if (job.status === "idle") {
    return null;
  }

  return (
    <div className="fixed bottom-[96px] left-4 right-4 z-50 mx-auto max-w-[520px] md:bottom-6 md:left-auto md:right-6 md:mx-0">
      <div className="glass-strong rounded-[22px] px-4 py-3 shadow-[0_18px_48px_hsl(var(--shadow)/0.34)]">
        <div className="flex items-start gap-3">
          <span className="icon-glass mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[hsl(var(--primary))]">
            {job.status === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : job.status === "complete" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4 text-[hsl(var(--danger))]" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {job.status === "pending"
                ? "Analyzing writing"
                : job.status === "complete"
                  ? "Analysis finished"
                  : "Analysis failed"}
            </p>
            <p className="mt-1 truncate text-sm text-[hsl(var(--muted))]">
              {job.status === "error" ? job.error : job.title}
            </p>
            {job.status === "complete" ? (
              <Link
                href={`/entries/${job.entryId}`}
                onClick={onDismiss}
                className="mt-3 inline-flex text-sm font-semibold text-[hsl(var(--primary))]"
              >
                View result
              </Link>
            ) : null}
          </div>

          {job.status !== "pending" ? (
            <button
              type="button"
              aria-label="Dismiss analysis status"
              onClick={onDismiss}
              className="focus-ring rounded-full p-1 text-[hsl(var(--muted))] transition hover:text-[hsl(var(--foreground))]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
