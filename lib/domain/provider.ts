import type { DomainStatus, Extension } from "@/types/name";

export interface DomainAvailabilityProvider {
  check(name: string, extension: Extension): Promise<DomainStatus>;
  checkSync?(name: string, extension: Extension): DomainStatus;
}
