import type { Extension, ShortlistEntry, WorkspaceVariant } from "@/types/name";
import { SparkIcon, StarIcon } from "./icons";

interface Props {
  entries: ShortlistEntry[];
  extensions: Extension[];
  generating: Set<string>;
  onNote: (sourceName: string, note: string) => void;
  onRemove: (sourceName: string) => void;
  onGenerate: (sourceName: string) => void;
  onChoose: (sourceName: string, variant: WorkspaceVariant) => void;
  onBack: (sourceName: string) => void;
}

export function ShortlistDrawer({ entries, extensions, generating, onNote, onRemove, onGenerate, onChoose, onBack }: Props) {
  if (!entries.length) return null;

  return (
    <section className="mt-5 rounded-2xl border border-line bg-panel/90 p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StarIcon filled className="h-4 w-4 text-lime" />
            <h2 className="font-display text-lg font-semibold">Name Workshop</h2>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted">{entries.length}</span>
          </div>
          <p className="mt-1 text-xs text-muted">Shape each idea through verified branches until it feels ownable.</p>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted">Green = at least one selected domain is available</div>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => {
          const currentName = entry.currentName || entry.name;
          const isGenerating = generating.has(entry.name);
          return (
            <article key={entry.name} className="overflow-hidden rounded-2xl border border-line bg-[#090b0e]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-4">
                <div>
                  {currentName !== entry.name && (
                    <div className="mb-1 text-[9px] uppercase tracking-[0.15em] text-muted">From {entry.name}</div>
                  )}
                  <div className="font-display text-2xl font-semibold tracking-tight">{currentName}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!!entry.history?.length && (
                    <button onClick={() => onBack(entry.name)} className="rounded-lg border border-line px-3 py-2 text-[10px] font-semibold text-muted transition hover:text-white">
                      ← Back
                    </button>
                  )}
                  <button
                    onClick={() => onGenerate(entry.name)}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 rounded-lg bg-lime px-3.5 py-2 text-[11px] font-bold text-ink transition hover:bg-[#d4fa84] disabled:opacity-50"
                  >
                    <SparkIcon className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                    {isGenerating ? "Exploring…" : "Generate variants"}
                  </button>
                  <button className="px-2 text-lg leading-none text-muted hover:text-white" aria-label={`Remove ${entry.name}`} onClick={() => onRemove(entry.name)}>×</button>
                </div>
              </div>

              <div className="p-4">
                {entry.variants?.length ? (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {entry.variants.map((variant) => {
                      const hasAvailable = extensions.some((extension) => variant.domains[extension] === "available");
                      return (
                        <button
                          key={variant.name}
                          onClick={() => onChoose(entry.name, variant)}
                          className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${hasAvailable ? "border-lime/40 bg-lime/[0.08] hover:bg-lime/[0.12]" : "border-line bg-white/[0.02] hover:bg-white/[0.045]"}`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="font-display text-sm font-semibold">{variant.name}</span>
                            <span className={`text-[10px] font-bold ${hasAvailable ? "text-lime" : "text-muted"}`}>{variant.total}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {extensions.map((extension) => (
                              <span key={extension} className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-1 text-[9px] ${variant.domains[extension] === "available" ? "border-lime/30 text-lime" : variant.domains[extension] === "taken" ? "border-rose-400/20 text-rose-300" : "border-line text-muted"}`}>
                                <span className="h-1 w-1 rounded-full bg-current" />{extension}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid min-h-20 place-items-center rounded-xl border border-dashed border-line text-center text-xs text-muted">
                    Generate a branch of close variants, then click one to keep shaping it.
                  </div>
                )}
                <input
                  className="control mt-3 !px-3 !py-2 text-xs"
                  placeholder="Notes, associations, positioning…"
                  value={entry.note}
                  onChange={(event) => onNote(entry.name, event.target.value)}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
