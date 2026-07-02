import { NextResponse } from "next/server";
import { researchDomain } from "@/lib/domain/research";
import type { DomainStatus } from "@/types/name";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ResearchItem {
  name: string;
  domain: string;
  status: DomainStatus;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { items?: unknown };
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "items must be an array" }, { status: 400 });
    }
    const items = body.items.filter((item): item is ResearchItem => {
      if (!item || typeof item !== "object") return false;
      const value = item as Partial<ResearchItem>;
      return typeof value.name === "string" && typeof value.domain === "string" &&
        ["available", "taken", "unknown"].includes(value.status || "");
    }).slice(0, 25);
    const results: Record<string, { website?: string; description?: string }> = {};
    for (let index = 0; index < items.length; index += 5) {
      const chunk = items.slice(index, index + 5);
      const researched = await Promise.all(
        chunk.map((item) => researchDomain(item.name, item.domain, item.status)),
      );
      chunk.forEach((item, chunkIndex) => { results[item.domain.toLowerCase()] = researched[chunkIndex]; });
    }
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Unable to research names" }, { status: 500 });
  }
}
