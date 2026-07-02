import { hashString, mulberry32, pick } from "@/lib/random";
import { scoreName } from "@/lib/scoring";
import type { GeneratorOptions, NameCandidate, Tone } from "@/types/name";

const BANNED = ["coin", "crypto", "trend", "signal", "pulse", "meme", "token"];
const STARTS = ["a", "e", "i", "o", "u", "al", "ar", "av", "el", "en", "ka", "lo", "ne", "no", "or", "ra", "sa", "ve", "vi", "za"];
const MIDDLES = ["la", "ve", "ri", "no", "va", "ta", "mi", "ra", "zo", "ki", "ly", "en", "vi", "ro", "qu", "xe", "fi", "na", "sy"];
const ENDINGS: Record<Tone, string[]> = {
  premium: ["ora", "aro", "elle", "ian", "ium", "era", "ori", "eva", "aire"],
  fintech: ["pay", "fi", "vest", "era", "ora", "ity", "wise", "via", "iq"],
  ai: ["ai", "ix", "iq", "bot", "syn", "mind", "ora", "gen", "os"],
  playful: ["ly", "sy", "pop", "zo", "bee", "loop", "io", "up", "go"],
  mysterious: ["yx", "noir", "vyn", "umbra", "ora", "nyx", "eth", "veil", "une"],
};
const PREFIXES: Record<Tone, string[]> = {
  premium: ["au", "vel", "el", "mon", "aur"],
  fintech: ["fin", "cred", "cap", "mon", "led"],
  ai: ["syn", "neu", "cog", "algo", "nex"],
  playful: ["bo", "zi", "lu", "pico", "mio"],
  mysterious: ["ny", "om", "vor", "noct", "ecl"],
};

function cleanRoot(root: string) {
  return root.toLowerCase().replace(/[^a-z]/g, "");
}

function rootFragment(root: string, random: () => number) {
  if (root.length <= 3) return root;
  const length = Math.max(2, Math.min(root.length, 2 + Math.floor(random() * 4)));
  const start = Math.floor(random() * Math.max(1, root.length - length + 1));
  return root.slice(start, start + length);
}

function smooth(value: string) {
  return value
    .replace(/(.)\1{2,}/g, "$1")
    .replace(/([aeiou])([aeiou])([aeiou])/g, "$1$3")
    .replace(/[^aeiou]{5,}/g, (match) => `${match.slice(0, 2)}a${match.slice(2)}`);
}

function mutate(value: string, random: () => number) {
  const substitutions: Record<string, string> = { c: "k", k: "c", i: "y", s: "z", f: "v", x: "ks" };
  if (random() > 0.48) return value;
  const indexes = [...value].map((letter, index) => substitutions[letter] ? index : -1).filter((index) => index >= 0);
  if (!indexes.length) return value;
  const index = pick(indexes, random);
  return value.slice(0, index) + substitutions[value[index]] + value.slice(index + 1);
}

function construct(options: GeneratorOptions, random: () => number) {
  const roots = options.roots.map(cleanRoot).filter(Boolean);
  const root = roots.length ? pick(roots, random) : pick(MIDDLES, random);
  const otherRoot = roots.length > 1 ? pick(roots.filter((item) => item !== root), random) : pick(MIDDLES, random);
  const method = Math.floor(random() * 6);
  let value = "";

  if (method === 0) value = rootFragment(root, random) + pick(ENDINGS[options.tone], random);
  if (method === 1) value = pick(PREFIXES[options.tone], random) + rootFragment(root, random);
  if (method === 2) value = rootFragment(root, random) + rootFragment(otherRoot, random);
  if (method === 3) value = pick(STARTS, random) + pick(MIDDLES, random) + pick(ENDINGS[options.tone], random);
  if (method === 4) value = rootFragment(root, random) + pick(MIDDLES, random) + pick(["a", "o", "i", "en", "is"], random);
  if (method === 5) value = pick(PREFIXES[options.tone], random) + pick(MIDDLES, random) + pick(["a", "o", "ia", "ix"], random);

  return mutate(smooth(value), random);
}

export function generateNames(options: GeneratorOptions): NameCandidate[] {
  const seed = options.seed ?? Date.now();
  const random = mulberry32(seed);
  const names = new Set<string>();
  let attempts = 0;

  while (names.size < options.count && attempts < options.count * 80) {
    attempts += 1;
    const generated = construct(options, random);
    if (
      generated.length >= options.minLength &&
      generated.length <= options.maxLength &&
      !BANNED.some((word) => generated.includes(word)) &&
      /^[a-z]+$/.test(generated)
    ) {
      names.add(generated[0].toUpperCase() + generated.slice(1));
    }
  }

  return [...names].map((name) => {
    const domains = { ".com": "unknown", ".ai": "unknown", ".io": "unknown" } as const;
    return {
      id: `${hashString(name)}-${seed}`,
      name,
      length: name.length,
      domains,
      ...scoreName(name),
    };
  }).sort((a, b) => b.total - a.total);
}
