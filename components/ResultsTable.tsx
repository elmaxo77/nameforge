import type { Extension, NameCandidate } from "@/types/name";
import { DomainBadge } from "./DomainBadge";
import { ScoreRing } from "./ScoreRing";
import { StarIcon } from "./icons";

export type SortKey = keyof Pick<NameCandidate, "name" | "length" | "total" | "pronounceability" | "memorability" | "uniqueness" | "brandability">;

interface Props {
  candidates: NameCandidate[];
  extension: Extension;
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

export function ResultsTable({ candidates, extension, shortlisted, onToggleShortlist, sort, descending, onSort, onVerify, verifying }: Props) {
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
            <th className="px-3 py-3.5"><Header label="Total" field="total" /></th>
            <th className="px-3 py-3.5"><Header label="Say it" field="pronounceability" /></th>
            <th className="px-3 py-3.5"><Header label="Recall" field="memorability" /></th>
            <th className="px-3 py-3.5"><Header label="Unique" field="uniqueness" /></th>
            <th className="px-3 py-3.5"><Header label="Brand" field="brandability" /></th>
            <th className="px-3 py-3.5">{extension}</th>
            <th className="px-3 py-3.5">Website</th>
            <th className="px-3 py-3.5">What it is</th>
            <th className="px-4 py-3.5 text-right">Save</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const saved = shortlisted.has(candidate.name);
            const research = candidate.research?.[extension];
            return (
              <tr key={candidate.id} className="group border-b border-line/70 transition hover:bg-white/[0.025]">
                <td className="px-5 py-3">
                  <div className="font-display text-[15px] font-semibold tracking-tight">{candidate.name}</div>
                  <div className="mt-0.5 text-[10px] text-muted">{candidate.length} letters</div>
                </td>
                <td className="px-3 py-3"><ScoreRing score={candidate.total} /></td>
                <td className="px-3 py-3"><Metric value={candidate.pronounceability} /></td>
                <td className="px-3 py-3"><Metric value={candidate.memorability} /></td>
                <td className="px-3 py-3"><Metric value={candidate.uniqueness} /></td>
                <td className="px-3 py-3"><Metric value={candidate.brandability} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <DomainBadge status={candidate.domains[extension]} />
                    <button
                      onClick={() => onVerify(candidate)}
                      disabled={verifying.has(candidate.id)}
                      className="rounded-md px-1.5 py-1 text-[9px] font-semibold text-muted transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                    >
                      {verifying.has(candidate.id) ? "…" : "Check"}
                    </button>
                  </div>
                </td>
                <td className="max-w-40 px-3 py-3">
                  {research?.website ? (
                    <a href={research.website} target="_blank" rel="noreferrer" className="block truncate text-xs font-medium text-lime hover:underline">
                      {research.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : <span className="text-xs text-[#4f5560]">—</span>}
                </td>
                <td className="max-w-72 px-3 py-3">
                  <p className="truncate text-xs text-[#aeb3bc]" title={research?.description}>
                    {research?.description || (candidate.domains[extension] === "unknown" ? "Verify domain first" : "Researching…")}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <button aria-label={saved ? `Remove ${candidate.name} from shortlist` : `Shortlist ${candidate.name}`} onClick={() => onToggleShortlist(candidate.name)} className={`rounded-lg p-2 transition ${saved ? "bg-lime/10 text-lime" : "text-[#545a64] hover:bg-white/5 hover:text-white"}`}>
                    <StarIcon filled={saved} className="h-4 w-4" />
                  </button>
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
