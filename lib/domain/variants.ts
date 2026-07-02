import { hashString, mulberry32, pick } from "@/lib/random";
import { scoreName } from "@/lib/scoring";

const VOWELS = ["a", "e", "i", "o", "u"];
const BRIDGES = ["l", "n", "r", "v", "x"];
const ENDINGS = ["a", "o", "i", "ly", "io", "ia", "ix", "en", "or"];

export function generateDomainVariants(rawName: string, limit = 40, targetLength?: number) {
  const name = rawName.toLowerCase().replace(/[^a-z]/g, "");
  const random = mulberry32(hashString(name));
  const variants = new Set<string>();

  // Try compact letter reshuffles first.
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const letters = [...name];
    for (let index = letters.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [letters[index], letters[target]] = [letters[target], letters[index]];
    }
    const shuffled = letters.join("");
    if (shuffled !== name && /[aeiou]/.test(shuffled)) variants.add(shuffled);
  }

  // Then explore close, pronounceable mutations.
  for (let index = 1; index < name.length && variants.size < limit; index += 1) {
    variants.add(`${name.slice(0, index)}${pick(VOWELS, random)}${name.slice(index)}`);
  }
  const stem = /[aeiou]$/.test(name) ? name.slice(0, -1) : name;
  for (const ending of ENDINGS) {
    variants.add(`${name}${ending}`);
    variants.add(`${stem}${ending}`);
  }
  for (const bridge of BRIDGES) {
    variants.add(`${name.slice(0, Math.ceil(name.length / 2))}${bridge}${name.slice(Math.ceil(name.length / 2))}`);
  }
  for (let attempt = 0; variants.size < limit && attempt < 50; attempt += 1) {
    const index = Math.floor(random() * Math.max(1, name.length));
    const letter = random() > 0.5 ? pick(VOWELS, random) : pick(BRIDGES, random);
    variants.add(`${name.slice(0, index)}${letter}${name.slice(index + 1)}${random() > 0.65 ? pick(ENDINGS, random) : ""}`);
  }

  if (targetLength) {
    const desired = Math.max(3, Math.min(12, targetLength));
    for (let attempt = 0; attempt < 160; attempt += 1) {
      let variant = name;
      while (variant.length < desired) {
        const index = Math.floor(random() * (variant.length + 1));
        const letter = random() > 0.45 ? pick(VOWELS, random) : pick(BRIDGES, random);
        variant = `${variant.slice(0, index)}${letter}${variant.slice(index)}`;
      }
      while (variant.length > desired) {
        const index = Math.floor(random() * variant.length);
        variant = `${variant.slice(0, index)}${variant.slice(index + 1)}`;
      }
      if (variant === name || random() > 0.3) {
        const index = Math.floor(random() * variant.length);
        const letter = random() > 0.45 ? pick(VOWELS, random) : pick(BRIDGES, random);
        variant = `${variant.slice(0, index)}${letter}${variant.slice(index + 1)}`;
      }
      variants.add(variant);
    }
  }

  return [...variants]
    .filter((variant) =>
      variant.length >= 3 &&
      variant.length <= 12 &&
      variant !== name &&
      (!targetLength || variant.length === targetLength) &&
      !/[^aeiouy]{3,}/.test(variant) &&
      scoreName(variant).pronounceability >= 72
    )
    .sort((left, right) => {
      const affinity = (variant: string) =>
        scoreName(variant).total +
        (variant.startsWith(name.slice(0, 2)) ? 24 : 0) +
        (variant.startsWith(name[0]) ? 8 : 0);
      return affinity(right) - affinity(left);
    })
    .slice(0, limit);
}
