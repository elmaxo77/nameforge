import type { DomainStatus } from "@/types/name";

interface BootstrapData {
  services: [string[], string[]][];
}

let bootstrapCache: { data: BootstrapData; expiresAt: number } | null = null;

async function getBootstrap(): Promise<BootstrapData> {
  if (bootstrapCache && bootstrapCache.expiresAt > Date.now()) return bootstrapCache.data;
  const response = await fetch("https://data.iana.org/rdap/dns.json", {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error("IANA bootstrap unavailable");
  const data = await response.json() as BootstrapData;
  bootstrapCache = { data, expiresAt: Date.now() + 86_400_000 };
  return data;
}

function findServer(data: BootstrapData, extension: string) {
  const tld = extension.replace(/^\./, "").toLowerCase();
  const bootstrapped = data.services.find(([tlds]) => tlds.includes(tld))?.[1]?.[0];
  if (bootstrapped) return bootstrapped;
  // .io operates RDAP but is not currently published in IANA's ccTLD bootstrap.
  if (tld === "io") return "https://rdap.identitydigital.services/rdap/";
  return undefined;
}

export async function checkDomainRdap(domain: string): Promise<DomainStatus> {
  const normalized = domain.trim().toLowerCase();
  if (!/^[a-z0-9-]+\.[a-z]{2,}$/.test(normalized)) return "unknown";
  try {
    const extension = normalized.slice(normalized.lastIndexOf("."));
    const server = findServer(await getBootstrap(), extension);
    if (!server) return "unknown";
    const response = await fetch(
      `${server.replace(/\/?$/, "/")}domain/${encodeURIComponent(normalized)}`,
      {
        headers: { Accept: "application/rdap+json, application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (response.status === 200) return "taken";
    if (response.status === 404) return "available";
    return "unknown";
  } catch {
    return "unknown";
  }
}
