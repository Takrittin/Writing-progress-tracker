import { metricLabels, scoreKeys, type WritingScoreMap } from "@/types/writing";
import { getScoreTone } from "@/lib/utils";

export function MetricGrid({ scores }: { scores: Partial<WritingScoreMap> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {scoreKeys.map((key) => {
        const score = scores[key] ?? 0;

        return (
          <div key={key} className="liquid-card rounded-[22px] p-4">
            <p className="text-sm font-medium text-[hsl(var(--muted))]">{metricLabels[key]}</p>
            <p className={`mt-3 text-3xl font-semibold ${getScoreTone(score)}`}>{score}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/58">
              <div
                className="primary-gradient h-full rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
