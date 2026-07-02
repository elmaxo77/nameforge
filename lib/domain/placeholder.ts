import type { DomainAvailabilityProvider } from "./provider";
import type { DomainStatus, Extension } from "@/types/name";
import { hashString } from "@/lib/random";

/**
 * Stable mock results make local demos and filters useful. Replace this
 * provider with an API-backed implementation without touching the UI.
 */
export class PlaceholderDomainProvider implements DomainAvailabilityProvider {
  checkSync(name: string, extension: Extension): DomainStatus {
    const value = hashString(`${name.toLowerCase()}${extension}`) % 10;
    if (value < 3) return "available";
    if (value < 7) return "taken";
    return "unknown";
  }

  async check(name: string, extension: Extension): Promise<DomainStatus> {
    return this.checkSync(name, extension);
  }
}

export const domainProvider = new PlaceholderDomainProvider();
