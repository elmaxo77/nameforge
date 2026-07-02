import type { Extension, NameCandidate } from "@/types/name";
import { ScoreRing } from "./ScoreRing";
import { AnvilIcon } from "./icons";

export type SortKey = keyof Pick<NameCandidate, "name" | "length" | "total" | "pronounceability" | "memorability" | "uniqueness" | "brandability">;

interface Props {
  candidates: NameCandidate[];
  extensions: Extension[];
  shortlisted: Set<string>;
  onToggleShortlist: (name: string) => void;
  sort: SortKey;
  descending: boolean;
  onSort: (key: SortKey) => void;
  onVerify: (candidate: NameCandidate) => void;
  verifying: Set<string>;
}

const Metric = ({ value }: { value: number }) => (
  <div className="flex min-w-[72px] items-center gap-2">
    <div className="h-1.5 w-10 overflow-hidden rounded-full bg-[#24282e]"><div className="h-full rounded-full bg-[#89945e]" style={{ width: `${value}%` }} /></div>
    <span className="text-xs text-[#c2c6cd]">{value}</span>
  </div>
);

export function ResultsTable({ candidates, extensions, shortlisted, onToggleShortlist, sort, descending, onSort, onVerify, verifying }: Props) {
  const Header = ({ label, field }: { label: string; field: SortKey }) => (
    <button className={`inline-flex items-center gap-1 transition hover:text-white ${sort === field ? "text-white" : ""}`} onClick={() => onSort(field)}>
      {label}<span className={sort === field && !descending ? "rotate-180" : ""}>↓</span>
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1240px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-[#0a0c0f] text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            <th className="px-5 py-3.5"><Header label="Name" field="name" /></th>
            <th className="px-3 py-3.5 text-center">Forge</th>
            <th className="px-3 py-3.5"><Header label="Total" field="total" /></th>
            <th className="px-3 py-3.5"><Header label="Say it" field="pronounceability" /></th>
            <th className="px-3 py-3.5"><Header label="Recall" field="memorability" /></th>
            <th className="px-3 py-3.5"><Header label="Unique" field="uniqueness" /></th>
            <th className="px-3 py-3.5"><Header label="Brand" field="brandability" /></th>
            <th className="px-3 py-3.5">Domains</th>
            <th className="px-3 py-3.5">What it is</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const saved = shortlisted.has(candidate.name);
            return (
              <tr key={candidate.id} className="group border-b border-line/70 transition hover:bg-white/[0.025]">
                <td className="px-5 py-3">
                  <div className="font-display text-[15px] font-semibold tracking-tight">{candidate.name}</div>
                  <div className="mt-0.5 text-[10px] text-muted">{candidate.length} letters</div>
                </td>
                <td className="px-3 py-3 text-center">
                  <button aria-label={saved ? `Remove ${candidate.name} from workshop` : `Forge ${candidate.name}`} title={saved ? "Remove from workshop" : "Send to Name Workshop"} onClick={() => onToggleShortlist(candidate.name)} className={`rounded-lg p-2 transition ${saved ? "bg-lime/10 text-lime" : "text-[#545a64] hover:bg-white/5 hover:text-white"}`}>
                    <AnvilIcon filled={saved} className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-3 py-3"><ScoreRing score={candidate.total} /></td>
                <td className="px-3 py-3"><Metric value={candidate.pronounceability} /></td>
                <td className="px-3 py-3"><Metric value={candidate.memorability} /></td>
                <td className="px-3 py-3"><Metric value={candidate.uniqueness} /></td>
                <td className="px-3 py-3"><Metric value={candidate.brandability} /></td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {extensions.map((extension) => {
                      const status = candidate.domains[extension];
                      const domain = `${candidate.name.toLowerCase()}${extension}`;
                      const styles = status === "available"
                        ? "border-lime/35 bg-lime/[0.08] text-lime"
                        : status === "taken"
                          ? "border-rose-400/25 bg-rose-400/[0.08] text-rose-300"
                          : "border-line bg-white/[0.025] text-muted";
                      const content = <><span className="h-1.5 w-1.5 rounded-full bg-current" />{domain}</>;
                      return status === "taken" ? (
                        <a key={extension} href={`https://${domain}`} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-semibold transition hover:brightness-125 ${styles}`}>
                          {content}
                        </a>
                      ) : (
                        <span key={extension} className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-semibold ${styles}`}>
                          {content}
                        </span>
                      );
                    })}
                    <button
                      onClick={() => onVerify(candidate)}
                      disabled={verifying.has(candidate.id)}
                      className="rounded-md px-1.5 py-1 text-[9px] font-semibold text-muted transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                    >
                      {verifying.has(candidate.id) ? "…" : "Check"}
                    </button>
                  </div>
                </td>
                <td className="max-w-80 px-3 py-3">
                  {candidate.summaries?.length ? (
                    <div className="space-y-1.5">
                      {candidate.summaries.map((summary, index) => (
                        <div key={`${summary.sourceDomain || "context"}-${index}`} className="flex min-w-0 items-center gap-1.5">
                          {summary.sourceDomain && (
                            <span className="shrink-0 rounded bg-rose-400/10 px-1.5 py-0.5 text-[8px] font-semibold text-rose-300">
                              {summary.sourceDomain}
                            </span>
                          )}
                          <p className="truncate text-[11px] text-[#aeb3bc]" title={summary.description}>
                            {summary.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#aeb3bc]">Verify domains to research this name</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!candidates.length && <div className="grid h-56 place-items-center text-sm text-muted">No names match these filters.</div>}
    </div>
  );
}
