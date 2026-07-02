import { NextResponse } from "next/server";
import { checkDomainRdap } from "@/lib/domain/rdap";
import { generateDomainVariants } from "@/lib/domain/variants";
import { scoreName } from "@/lib/scoring";
import type { Extension, WorkspaceVariant } from "@/types/name";

export const maxDuration = 30;

const allowedExtensions: Extension[] = [".com", ".ai", ".io"];

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: unknown; extensions?: unknown };
    if (typeof body.name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    const requested = Array.isArray(body.extensions)
      ? body.extensions.filter((value): value is Extension => allowedExtensions.includes(value as Extension))
      : allowedExtensions;
    const extensions = requested.length ? requested : allowedExtensions;
    const names = generateDomainVariants(body.name, 12).slice(0, 8);
    const variants: WorkspaceVariant[] = [];

    for (const name of names) {
      const domains = { ".com": "unknown", ".ai": "unknown", ".io": "unknown" } as WorkspaceVariant["domains"];
      const statuses = await Promise.all(
        extensions.map((extension) => checkDomainRdap(`${name}${extension}`)),
      );
      extensions.forEach((extension, index) => { domains[extension] = statuses[index]; });
      variants.push({
        name: name[0].toUpperCase() + name.slice(1),
        domains,
        total: scoreName(name).total,
      });
    }

    variants.sort((left, right) => {
      const leftAvailable = Object.values(left.domains).includes("available") ? 1 : 0;
      const rightAvailable = Object.values(right.domains).includes("available") ? 1 : 0;
      return rightAvailable - leftAvailable || right.total - left.total;
    });
    return NextResponse.json({ variants });
  } catch {
    return NextResponse.json({ error: "Unable to generate workspace variants" }, { status: 500 });
  }
}
