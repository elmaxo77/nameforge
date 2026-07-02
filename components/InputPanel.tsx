import type { Extension, GeneratorOptions, Tone } from "@/types/name";
import { SparkIcon } from "./icons";

interface Props {
  options: GeneratorOptions;
  setOptions: (options: GeneratorOptions) => void;
  onGenerate: () => void;
  generating: boolean;
}

const tones: Tone[] = ["premium", "fintech", "ai", "playful", "mysterious"];
const extensions: Extension[] = [".com", ".ai", ".io"];

export function InputPanel({ options, setOptions, onGenerate, generating }: Props) {
  const set = <K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) =>
    setOptions({ ...options, [key]: value });

  return (
    <aside className="h-fit min-w-0 rounded-2xl border border-line bg-panel/90 p-5 shadow-glow lg:sticky lg:top-6">
      <div className="mb-6">
        <p className="mb-1 font-display text-lg font-semibold">Build your brief</p>
        <p className="text-xs leading-5 text-muted">Give the engine a few ingredients to work with.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="roots">Root words</label>
          <textarea
            id="roots"
            className="control min-h-28 resize-y"
            placeholder={"forge\nnova\natlas"}
            value={options.roots.join("\n")}
            onChange={(event) => set("roots", event.target.value.split(/[\n,]+/))}
          />
          <p className="mt-1.5 text-[10px] text-[#636975]">One root per line or comma separated.</p>
        </div>

        <div>
          <label className="label" htmlFor="tone">Desired tone</label>
          <select id="tone" className="control capitalize" value={options.tone} onChange={(event) => set("tone", event.target.value as Tone)}>
            {tones.map((tone) => <option key={tone}>{tone}</option>)}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label !mb-0">Name length</label>
            <span className="text-xs font-medium text-lime">{options.minLength}–{options.maxLength} letters</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="rounded-xl border border-line bg-[#090b0e] px-3 py-2">
              <span className="block text-[9px] uppercase tracking-wider text-muted">Min</span>
              <input className="w-full bg-transparent text-sm outline-none" type="number" min={3} max={options.maxLength} value={options.minLength} onChange={(e) => set("minLength", Math.max(3, Number(e.target.value)))} />
            </label>
            <label className="rounded-xl border border-line bg-[#090b0e] px-3 py-2">
              <span className="block text-[9px] uppercase tracking-wider text-muted">Max</span>
              <input className="w-full bg-transparent text-sm outline-none" type="number" min={options.minLength} max={18} value={options.maxLength} onChange={(e) => set("maxLength", Math.min(18, Number(e.target.value)))} />
            </label>
          </div>
        </div>

        <fieldset>
          <legend className="label">Domain extensions</legend>
          <div className="grid grid-cols-3 gap-2">
            {extensions.map((ext) => {
              const active = options.extensions.includes(ext);
              return (
                <button
                  key={ext}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set("extensions", active ? options.extensions.filter((item) => item !== ext) : [...options.extensions, ext])}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${active ? "border-lime/35 bg-lime/10 text-lime" : "border-line bg-[#090b0e] text-muted hover:text-white"}`}
                >
                  {ext}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          onClick={onGenerate}
          disabled={generating || !options.extensions.length}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3.5 text-sm font-bold text-ink transition hover:bg-[#d4fa84] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SparkIcon className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Forging names…" : "Generate 500 names"}
        </button>
      </div>
    </aside>
  );
}
