export type Tone = "premium" | "fintech" | "ai" | "playful" | "mysterious";
export type Extension = ".com" | ".ai" | ".io";
export type DomainStatus = "available" | "taken" | "unknown";

export interface GeneratorOptions {
  roots: string[];
  tone: Tone;
  minLength: number;
  maxLength: number;
  extensions: Extension[];
  count: number;
  seed?: number;
}

export interface NameScores {
  pronounceability: number;
  memorability: number;
  uniqueness: number;
  brandability: number;
  total: number;
}

export interface NameCandidate extends NameScores {
  id: string;
  name: string;
  length: number;
  domains: Record<Extension, DomainStatus>;
  research?: Partial<Record<Extension, { website?: string; description?: string }>>;
}

export interface ShortlistEntry {
  name: string;
  currentName?: string;
  targetLength?: number;
  history?: string[];
  variants?: WorkspaceVariant[];
  note: string;
  addedAt: number;
}

export interface WorkspaceVariant {
  name: string;
  domains: Record<Extension, DomainStatus>;
  total: number;
}
