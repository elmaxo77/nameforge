import { NextResponse } from "next/server";
import { checkDomainRdap } from "@/lib/domain/rdap";
import { generateDomainVariants } from "@/lib/domain/variants";
import type { Extension } from "@/types/name";

export const maxDuration = 30;

const extensions: Extension[] = [".com", ".ai", ".io"];

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: unknown; extension?: unknown };
    if (typeof body.name !== "string" || !extensions.includes(body.extension as Extension)) {
      return NextResponse.json({ error: "Invalid name or extension" }, { status: 400 });
    }
    const extension = body.extension as Extension;
    const variants = generateDomainVariants(body.name, 40);
    let attempts = 0;

    for (let index = 0; index < variants.length; index += 5) {
      const chunk = variants.slice(index, index + 5);
      const statuses = await Promise.all(
        chunk.map((variant) => checkDomainRdap(`${variant}${extension}`)),
      );
      attempts += chunk.length;
      const availableIndex = statuses.findIndex((status) => status === "available");
      if (availableIndex >= 0) {
        const name = chunk[availableIndex];
        return NextResponse.json({
          name: name[0].toUpperCase() + name.slice(1),
          domain: `${name}${extension}`,
          attempts: attempts - chunk.length + availableIndex + 1,
        });
      }
    }

    return NextResponse.json({ name: null, attempts, message: "No available close variant found." });
  } catch {
    return NextResponse.json({ error: "Unable to explore variants" }, { status: 500 });
  }
}
