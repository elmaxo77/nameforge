"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_OPTIONS } from "@/data/seed";
import { exportCandidatesCsv } from "@/lib/csv";
import { generateNames } from "@/lib/generator";
import { scoreName } from "@/lib/scoring";
import type { Extension, GeneratorOptions, NameCandidate, ShortlistEntry, WorkspaceVariant } from "@/types/name";
import { DownloadIcon, GlobeIcon, SparkIcon } from "./icons";
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
  const [verifying, setVerifying] = useState<Set<string>>(new Set());
  const [exploring, setExploring] = useState<Set<string>>(new Set());
  const [exploreErrors, setExploreErrors] = useState<Record<string, string>>({});
  const [workshopGenerating, setWorkshopGenerating] = useState<Set<string>>(new Set());

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
    setFilters({ minScore: 0, maxLength: 18, status: "all" });
    setVisibleCount(60);
    window.setTimeout(() => {
      setCandidates(generateNames({ ...options, count: 500, seed: Date.now() }));
      setGenerating(false);
    }, 250);
  };

  const toggleShortlist = (name: string) => {
    const isRemoving = shortlist.some((item) => item.name === name);
    setShortlist((current) =>
      isRemoving
        ? current.filter((item) => item.name !== name)
        : [{ name, note: "", addedAt: Date.now() }, ...current],
    );
    if (!isRemoving) {
      window.setTimeout(() => {
        document.getElementById("name-workshop")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  };

  const changeSort = (key: SortKey) => {
    if (sort === key) setDescending(!descending);
    else { setSort(key); setDescending(key !== "name"); }
  };

  const verifyDomains = async (items: NameCandidate[]) => {
    const batch = items.slice(0, 25);
    if (!batch.length) return;
    setVerifying((current) => new Set([...current, ...batch.map((item) => item.id)]));
    try {
      const domains = batch.map((item) => `${item.name.toLowerCase()}${extension}`);
      const response = await fetch("/api/domains/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains }),
      });
      if (!response.ok) throw new Error("Domain check failed");
      const data = await response.json() as {
        results: Record<string, NameCandidate["domains"][Extension]>;
      };
      setCandidates((current) => current.map((candidate) => {
        const domain = `${candidate.name.toLowerCase()}${extension}`;
        return data.results[domain]
          ? { ...candidate, domains: { ...candidate.domains, [extension]: data.results[domain] } }
          : candidate;
      }));

      const researchResponse = await fetch("/api/domains/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: batch.map((item) => {
            const domain = `${item.name.toLowerCase()}${extension}`;
            return { name: item.name, domain, status: data.results[domain] || "unknown" };
          }),
        }),
      });
      if (researchResponse.ok) {
        const researchData = await researchResponse.json() as {
          results: Record<string, { website?: string; description?: string }>;
        };
        setCandidates((current) => current.map((candidate) => {
          const domain = `${candidate.name.toLowerCase()}${extension}`;
          return researchData.results[domain]
            ? {
                ...candidate,
                research: {
                  ...candidate.research,
                  [extension]: researchData.results[domain],
                },
              }
            : candidate;
        }));
      }
    } finally {
      setVerifying((current) => {
        const next = new Set(current);
        batch.forEach((item) => next.delete(item.id));
        return next;
      });
    }
  };

  const exploreCandidate = async (candidate: NameCandidate) => {
    setExploring((current) => new Set(current).add(candidate.id));
    try {
      const response = await fetch("/api/domains/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: candidate.name, extension }),
      });
      if (!response.ok) throw new Error("Exploration failed");
      const result = await response.json() as {
        name: string | null;
        domain?: string;
        attempts: number;
      };
      if (!result.name || !result.domain) {
        setExploreErrors((current) => ({ ...current, [candidate.id]: "No available close variant found" }));
        return;
      }
      const newCandidate: NameCandidate = {
        id: candidate.id,
        name: result.name,
        length: result.name.length,
        domains: {
          ".com": extension === ".com" ? "available" : "unknown",
          ".ai": extension === ".ai" ? "available" : "unknown",
          ".io": extension === ".io" ? "available" : "unknown",
        },
        research: {
          [extension]: { description: `Available close variant of ${candidate.name}.` },
        },
        ...scoreName(result.name),
      };
      setCandidates((current) =>
        current.map((item) => item.id === candidate.id ? newCandidate : item),
      );
      setExploreErrors((current) => {
        const next = { ...current };
        delete next[candidate.id];
        return next;
      });
    } catch {
      setExploreErrors((current) => ({ ...current, [candidate.id]: "Exploration unavailable — try again" }));
    } finally {
      setExploring((current) => {
        const next = new Set(current);
        next.delete(candidate.id);
        return next;
      });
    }
  };

  const generateWorkspaceVariants = async (sourceName: string) => {
    const entry = shortlist.find((item) => item.name === sourceName);
    if (!entry) return;
    setWorkshopGenerating((current) => new Set(current).add(sourceName));
    try {
      const response = await fetch("/api/workspace/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: entry.currentName || entry.name,
          extensions: options.extensions,
        }),
      });
      if (!response.ok) throw new Error("Variant generation failed");
      const data = await response.json() as { variants: WorkspaceVariant[] };
      setShortlist((current) => current.map((item) =>
        item.name === sourceName ? { ...item, variants: data.variants } : item,
      ));
    } finally {
      setWorkshopGenerating((current) => {
        const next = new Set(current);
        next.delete(sourceName);
        return next;
      });
    }
  };

  const chooseWorkspaceVariant = (sourceName: string, variant: WorkspaceVariant) => {
    setShortlist((current) => current.map((entry) => {
      if (entry.name !== sourceName) return entry;
      const previous = entry.currentName || entry.name;
      return {
        ...entry,
        currentName: variant.name,
        history: [...(entry.history || []), previous],
        variants: undefined,
      };
    }));
  };

  const stepWorkspaceBack = (sourceName: string) => {
    setShortlist((current) => current.map((entry) => {
      if (entry.name !== sourceName || !entry.history?.length) return entry;
      const history = [...entry.history];
      const previous = history.pop();
      return { ...entry, currentName: previous || entry.name, history, variants: undefined };
    }));
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
                <p className="mt-0.5 text-[10px] text-muted">Domain results come from live registry RDAP checks.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button disabled={verifying.size > 0} onClick={() => verifyDomains(filtered)} className="inline-flex items-center gap-2 rounded-xl border border-lime/25 bg-lime/10 px-3.5 py-2.5 text-xs font-semibold text-lime transition hover:bg-lime/15 disabled:opacity-50">
                  <GlobeIcon className={`h-4 w-4 ${verifying.size ? "animate-spin" : ""}`} />
                  {verifying.size ? "Checking…" : `Verify top 25 ${extension}`}
                </button>
                <button onClick={() => exportCandidatesCsv(filtered, options.extensions)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.025] px-3.5 py-2.5 text-xs font-semibold text-[#d7d9de] transition hover:border-[#353a43] hover:bg-white/5">
                  <DownloadIcon className="h-4 w-4" /> Export CSV
                </button>
              </div>
            </div>

            <Filters
              filters={filters}
              setFilters={(value) => { setFilters(value); setVisibleCount(60); }}
              extension={extension}
              setExtension={(value) => {
                setExtension(value);
                setFilters((current) => ({ ...current, status: "all" }));
                setVisibleCount(60);
              }}
              availableExtensions={options.extensions}
            />
            <ResultsTable candidates={filtered.slice(0, visibleCount)} extension={extension} shortlisted={new Set(shortlist.map((item) => item.name))} onToggleShortlist={toggleShortlist} sort={sort} descending={descending} onSort={changeSort} onVerify={(candidate) => verifyDomains([candidate])} verifying={verifying} onExplore={exploreCandidate} exploring={exploring} exploreErrors={exploreErrors} />
            {visibleCount < filtered.length && (
              <div className="border-t border-line p-4 text-center">
                <button onClick={() => setVisibleCount((count) => count + 60)} className="rounded-xl border border-line px-5 py-2.5 text-xs font-semibold text-muted transition hover:bg-white/5 hover:text-white">Show 60 more</button>
              </div>
            )}
          </section>

          <ShortlistDrawer
            entries={shortlist}
            extensions={options.extensions}
            generating={workshopGenerating}
            onRemove={toggleShortlist}
            onNote={(name, note) => setShortlist((current) => current.map((entry) => entry.name === name ? { ...entry, note } : entry))}
            onGenerate={generateWorkspaceVariants}
            onChoose={chooseWorkspaceVariant}
            onBack={stepWorkspaceBack}
          />
        </div>
      </div>

      <footer className="mt-12 flex flex-wrap justify-between gap-2 border-t border-line/60 pt-5 text-[10px] text-[#555b65]">
        <span>NAMEFORGE / MVP 01</span>
        <span>500 ideas. One name worth remembering.</span>
      </footer>
    </main>
  );
}
