import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { DomainStatus } from "@/types/name";

const ALLOWED_TLDS = [".com", ".ai", ".io"];

const decode = (value: string) => value
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/\s+/g, " ")
  .trim();

const shorten = (value: string, limit = 150) =>
  value.length > limit ? `${value.slice(0, limit - 1).trim()}…` : value;

function isPrivateAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const value = address.toLowerCase();
  return value === "::1" || value === "::" || value.startsWith("fc") ||
    value.startsWith("fd") || value.startsWith("fe8") || value.startsWith("fe9") ||
    value.startsWith("fea") || value.startsWith("feb");
}

async function isPublicHost(hostname: string) {
  try {
    const addresses = await lookup(hostname, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
}

function extractMeta(html: string) {
  const description =
    html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["'][^>]*>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return shorten(decode(description || title || ""));
}

async function researchWebsite(domain: string) {
  const url = `https://${domain}`;
  if (!await isPublicHost(domain)) {
    return { website: url, description: "Registered domain; no public website could be reached." };
  }
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "NameForge/1.0 domain research" },
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        const target = new URL(location, url);
        if (target.hostname === domain || target.hostname === `www.${domain}`) {
          const redirected = await fetch(target, {
            headers: { "User-Agent": "NameForge/1.0 domain research" },
            cache: "no-store",
            signal: AbortSignal.timeout(4000),
          });
          const html = new TextDecoder().decode((await redirected.arrayBuffer()).slice(0, 250_000));
          return { website: url, description: extractMeta(html) || "Registered domain with an active website." };
        }
      }
    }
    if (!response.ok) return { website: url, description: "Registered domain; website is unavailable or parked." };
    const html = new TextDecoder().decode((await response.arrayBuffer()).slice(0, 250_000));
    return { website: url, description: extractMeta(html) || "Registered domain with an active website." };
  } catch {
    return { website: url, description: "Registered domain; no public website could be reached." };
  }
}

async function researchName(name: string) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(name)}&limit=1`,
      {
        headers: { "User-Agent": "NameForge/1.0 (https://nameforge-tawny.vercel.app)" },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!response.ok) throw new Error("Wikipedia unavailable");
    const data = await response.json() as {
      pages?: Array<{ title?: string; description?: string | null; excerpt?: string }>;
    };
    const match = data.pages?.[0];
    if (!match?.title) return { description: "No notable name matches found." };
    const context = decode(match.description || match.excerpt || "");
    return { description: shorten(`${match.title}${context ? ` — ${context}` : ""}`) };
  } catch {
    return { description: "No notable name matches found." };
  }
}

export async function researchDomain(name: string, domain: string, status: DomainStatus) {
  const normalized = domain.toLowerCase();
  if (!/^[a-z0-9-]+\.[a-z]{2,}$/.test(normalized) || !ALLOWED_TLDS.some((tld) => normalized.endsWith(tld))) {
    return { description: "Research unavailable." };
  }
  if (status === "taken") return researchWebsite(normalized);
  if (status === "available") return researchName(name);
  return { description: "Verify the domain to research this name." };
}
