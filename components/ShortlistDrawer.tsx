import type { ShortlistEntry } from "@/types/name";
import { StarIcon } from "./icons";

interface Props {
  entries: ShortlistEntry[];
  onNote: (name: string, note: string) => void;
  onRemove: (name: string) => void;
}

export function ShortlistDrawer({ entries, onNote, onRemove }: Props) {
  if (!entries.length) return null;
  return (
    <section className="mt-5 rounded-2xl border border-line bg-panel/90 p-5">
      <div className="mb-4 flex items-center gap-2">
        <StarIcon filled className="h-4 w-4 text-lime" />
        <h2 className="font-display text-base font-semibold">Shortlist</h2>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted">{entries.length}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <div key={entry.name} className="rounded-xl border border-line bg-[#090b0e] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-sm font-semibold">{entry.name}</span>
              <button className="text-lg leading-none text-muted hover:text-white" aria-label={`Remove ${entry.name}`} onClick={() => onRemove(entry.name)}>×</button>
            </div>
            <input className="control !px-2.5 !py-2 text-xs" placeholder="Add a note…" value={entry.note} onChange={(e) => onNote(entry.name, e.target.value)} />
          </div>
        ))}
      </div>
    </section>
  );
}
