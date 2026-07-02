import type { Extension, NameCandidate } from "@/types/name";

const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export function exportCandidatesCsv(candidates: NameCandidate[], extensions: Extension[]) {
  const headers = [
    "Name", "Length", "Total", "Pronounceability", "Memorability",
    "Uniqueness", "Brandability", ...extensions.map((ext) => `${ext} status`),
  ];
  const rows = candidates.map((item) => [
    item.name, item.length, item.total, item.pronounceability, item.memorability,
    item.uniqueness, item.brandability, ...extensions.map((ext) => item.domains[ext]),
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nameforge-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
