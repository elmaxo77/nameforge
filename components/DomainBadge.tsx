import type { DomainStatus } from "@/types/name";

const styles: Record<DomainStatus, string> = {
  available: "border-lime/25 bg-lime/10 text-lime",
  taken: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  unknown: "border-white/10 bg-white/[0.035] text-muted",
};

export function DomainBadge({ status }: { status: DomainStatus }) {
  return (
    <span className={`inline-flex min-w-[76px] items-center justify-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
