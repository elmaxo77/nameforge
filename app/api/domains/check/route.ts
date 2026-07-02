import { NextResponse } from "next/server";
import { checkDomainRdap } from "@/lib/domain/rdap";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { domains?: unknown };
    if (!Array.isArray(body.domains)) {
      return NextResponse.json({ error: "domains must be an array" }, { status: 400 });
    }
    const domains = [...new Set(
      body.domains
        .filter((domain): domain is string => typeof domain === "string")
        .map((domain) => domain.trim().toLowerCase()),
    )].slice(0, 25);
    const results: Record<string, Awaited<ReturnType<typeof checkDomainRdap>>> = {};
    for (let index = 0; index < domains.length; index += 5) {
      const chunk = domains.slice(index, index + 5);
      const statuses = await Promise.all(chunk.map(checkDomainRdap));
      chunk.forEach((domain, chunkIndex) => { results[domain] = statuses[chunkIndex]; });
    }
    return NextResponse.json({ results, checkedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Unable to check domains" }, { status: 500 });
  }
}
