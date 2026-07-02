import type { DomainStatus, Extension } from "@/types/name";

export interface FilterState {
  minScore: number;
  maxLength: number;
  status: DomainStatus | "all";
}

interface Props {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  extension: Extension;
  setExtension: (extension: Extension) => void;
  availableExtensions: Extension[];
}

export function Filters({ filters, setFilters, extension, setExtension, availableExtensions }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-line px-4 py-4 sm:px-5">
      <label className="min-w-36 flex-1">
        <span className="label">Minimum score · {filters.minScore}</span>
        <input className="w-full accent-lime" type="range" min={0} max={95} step={5} value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })} />
      </label>
      <label>
        <span className="label">Max length</span>
        <select className="control !w-28 !py-2" value={filters.maxLength} onChange={(e) => setFilters({ ...filters, maxLength: Number(e.target.value) })}>
          {[6, 8, 10, 12, 18].map((length) => <option key={length} value={length}>{length}</option>)}
        </select>
      </label>
      <label>
        <span className="label">Domain</span>
        <select className="control !w-28 !py-2" value={extension} onChange={(e) => setExtension(e.target.value as Extension)}>
          {availableExtensions.map((ext) => <option key={ext}>{ext}</option>)}
        </select>
      </label>
      <label>
        <span className="label">Status</span>
        <select className="control !w-32 !py-2 capitalize" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterState["status"] })}>
          {["all", "available", "taken", "unknown"].map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
    </div>
  );
}
