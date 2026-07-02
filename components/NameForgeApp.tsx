"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_OPTIONS } from "@/data/seed";
import { exportCandidatesCsv } from "@/lib/csv";
import { generateNames } from "@/lib/generator";
import type { Extension, GeneratorOptions, NameCandidate, ShortlistEntry } from "@/types/name";
import { DownloadIcon, SparkIcon } from "./icons";
import { InputPanel } from "./InputPanel";
import { Filters, type FilterState } from "./Filters";
import { ResultsTable, type SortKey } from "./ResultsTable";
import { ShortlistDrawer } from "./ShortlistDrawer";

const STORAGE_KEY = "nameforge-shortlist-v1";

export function NameForgeApp() {
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [candidates, setCandidates] = useState<NameCandidate[]>(() => generateNames(DEFAULT_OPTIONS));
  const [generating, setGenerating] = useState(false);
  const [extension, setExtension] = useState<Extension>(".com");
  const [filters, setFilters] = useState<FilterState>({ minScore: 0, maxLength: 18, status: "all" });
  const [sort, setSort] = useState<SortKey>("total");
  const [descending, setDescending] = useState(true);
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setShortlist(JSON.parse(saved));
    } catch { /* storage is optional */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortlist));
  }, [shortlist]);

  const filtered = useMemo(() => {
    const result = candidates.filter((item) =>
      item.total >= filters.minScore &&
      item.length <= filters.maxLength &&
      (filters.status === "all" || item.domains[extension] === filters.status),
    );
    return result.sort((a, b) => {
      const left = a[sort];
      const right = b[sort];
      const comparison = typeof left === "string" ? left.localeCompare(String(right)) : left - Number(right);
      return descending ? -comparison : comparison;
    });
  }, [candidates, descending, extension, filters, sort]);

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setCandidates(generateNames({ ...options, count: 500, seed: Date.now() }));
      setVisibleCount(60);
      setGenerating(false);
    }, 250);
  };

  const toggleShortlist = (name: string) => {
    setShortlist((current) =>
      current.some((item) => item.name === name)
        ? current.filter((item) => item.name !== name)
        : [{ name, note: "", addedAt: Date.now() }, ...current],
    );
  };

  const changeSort = (key: SortKey) => {
    if (sort === key) setDescending(!descending);
    else { setSort(key); setDescending(key !== "name"); }
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between border-b border-line/70 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-lime/25 bg-lime/10 text-lime"><SparkIcon className="h-5 w-5" /></div>
          <div>
            <div className="font-display text-base font-bold tracking-tight">NameForge</div>
            <div className="text-[10px] text-muted">Naming intelligence</div>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-lime" /> Local engine · no API fees</div>
      </header>

      <section className="py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b1b6bf]">
            <span className="text-lime">✦</span> From roots to remarkable
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-[-0.04em] sm:text-6xl">Find the names you can <span className="text-lime">actually own.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted sm:text-base">Forge distinctive, pronounceable startup names. Score every idea, check domain signals, and save the ones worth building on.</p>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[285px_minmax(0,1fr)]">
        <InputPanel options={options} setOptions={setOptions} onGenerate={generate} generating={generating} />
        <div>
          <section className="overflow-hidden rounded-2xl border border-line bg-panel/90 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <h2 className="font-display text-lg font-semibold">Forged names</h2>
                  <span className="text-xs text-muted">{filtered.length} of {candidates.length}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted">Placeholder domain signals are deterministic, not live checks.</p>
              </div>
              <button onClick={() => exportCandidatesCsv(filtered, options.extensions)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.025] px-3.5 py-2.5 text-xs font-semibold text-[#d7d9de] transition hover:border-[#353a43] hover:bg-white/5">
                <DownloadIcon className="h-4 w-4" /> Export CSV
              </button>
            </div>

            <Filters filters={filters} setFilters={(value) => { setFilters(value); setVisibleCount(60); }} extension={extension} setExtension={setExtension} availableExtensions={options.extensions} />
            <ResultsTable candidates={filtered.slice(0, visibleCount)} extension={extension} shortlisted={new Set(shortlist.map((item) => item.name))} onToggleShortlist={toggleShortlist} sort={sort} descending={descending} onSort={changeSort} />
            {visibleCount < filtered.length && (
              <div className="border-t border-line p-4 text-center">
                <button onClick={() => setVisibleCount((count) => count + 60)} className="rounded-xl border border-line px-5 py-2.5 text-xs font-semibold text-muted transition hover:bg-white/5 hover:text-white">Show 60 more</button>
              </div>
            )}
          </section>

          <ShortlistDrawer entries={shortlist} onRemove={toggleShortlist} onNote={(name, note) => setShortlist((current) => current.map((entry) => entry.name === name ? { ...entry, note } : entry))} />
        </div>
      </div>

      <footer className="mt-12 flex flex-wrap justify-between gap-2 border-t border-line/60 pt-5 text-[10px] text-[#555b65]">
        <span>NAMEFORGE / MVP 01</span>
        <span>500 ideas. One name worth remembering.</span>
      </footer>
    </main>
  );
}
