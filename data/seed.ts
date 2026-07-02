import type { GeneratorOptions } from "@/types/name";

export const DEFAULT_OPTIONS: GeneratorOptions = {
  roots: ["forge", "nova", "atlas"],
  tone: "premium",
  minLength: 5,
  maxLength: 10,
  extensions: [".com", ".ai", ".io"],
  count: 500,
  seed: 42,
};

export const SEED_NAMES = [
  "Avenor", "Novara", "Velora", "Orvian", "Zenvia", "Lunaro",
  "Aureli", "Kovari", "Elvora", "Nexari", "Solvyn", "Arqen",
];
