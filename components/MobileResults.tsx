import type { Extension, NameCandidate } from "@/types/name";
import { AnvilIcon } from "./icons";
import { ScoreRing } from "./ScoreRing";

interface Props {
  candidates: NameCandidate[];
  extensions: Extension[];
  shortlisted: Set<string>;
  verifying: Set<string>;
  onToggleShortlist: (name: string) => void;
  onVerify: (candidate: NameCandidate) => void;
}

export function MobileResults({ candidates, extensions, shortlisted, verifying, onToggleShortlist, onVerify }: Props) {
  return (
    <div className="divide-y divide-line/70 md:hidden">
      {candidates.map((candidate) => {
        const saved = shortlisted.has(candidate.name);
        return (
          <article key={candidate.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-xl font-semibold">{candidate.name}</div>
                <div className="text-[10px] text-muted">{candidate.length} letters</div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreRing score={candidate.total} />
                <button
                  aria-label={saved ? `Remove ${candidate.name} from workshop` : `Forge ${candidate.name}`}
                  onClick={() => onToggleShortlist(candidate.name)}
                  className={`rounded-xl border p-2.5 transition ${saved ? "border-lime/30 bg-lime/10 text-lime" : "border-line text-muted"}`}
                >
                  <AnvilIcon filled={saved} className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {[
                ["Say", candidate.pronounceability],
                ["Recall", candidate.memorability],
                ["Unique", candidate.uniqueness],
                ["Brand", candidate.brandability],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border border-line bg-white/[0.02] px-1 py-2 text-center">
                  <div className="text-[8px] uppercase tracking-wider text-muted">{label}</div>
                  <div className="mt-0.5 text-xs font-bold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {extensions.map((extension) => {
                const status = candidate.domains[extension];
                const domain = `${candidate.name.toLowerCase()}${extension}`;
                const classes = status === "available"
                  ? "border-lime/35 bg-lime/[0.08] text-lime"
                  : status === "taken"
                    ? "border-rose-400/25 bg-rose-400/[0.08] text-rose-300"
                    : "border-line text-muted";
                const content = <><span className="h-1.5 w-1.5 rounded-full bg-current" />{domain}</>;
                return status === "taken" ? (
                  <a key={extension} href={`https://${domain}`} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1.5 text-[10px] font-semibold ${classes}`}>
                    {content}
                  </a>
                ) : (
                  <span key={extension} className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1.5 text-[10px] font-semibold ${classes}`}>
                    {content}
                  </span>
                );
              })}
              <button
                onClick={() => onVerify(candidate)}
                disabled={verifying.has(candidate.id)}
                className="rounded-lg border border-line px-2.5 py-1 text-[10px] font-semibold text-muted disabled:opacity-40"
              >
                {verifying.has(candidate.id) ? "Checking…" : "Check all"}
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              {candidate.summaries?.length ? candidate.summaries.map((summary, index) => (
                  <div key={`${summary.sourceDomain || "context"}-${index}`} className="flex items-start gap-1.5">
                    {summary.sourceDomain && <span className="shrink-0 rounded bg-rose-400/10 px-1.5 py-0.5 text-[8px] font-semibold text-rose-300">{summary.sourceDomain}</span>}
                    <p className="line-clamp-2 text-[11px] leading-4 text-[#aeb3bc]">{summary.description}</p>
                  </div>
                )) : <p className="text-[11px] text-muted">Verify domains to research this name</p>}
            </div>
          </article>
        );
      })}
      {!candidates.length && <div className="grid h-40 place-items-center text-sm text-muted">No names match these filters.</div>}
    </div>
  );
}
