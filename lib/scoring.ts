import type { NameScores } from "@/types/name";

const vowels = new Set(["a", "e", "i", "o", "u", "y"]);
const awkward = ["aaa", "eee", "iii", "ooo", "uuu", "qx", "jq", "wz", "zx", "yy"];
const familiarEndings = ["a", "o", "io", "ia", "ly", "or", "en", "on", "is", "um", "ix"];

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function transitions(name: string) {
  let count = 0;
  for (let i = 1; i < name.length; i += 1) {
    if (vowels.has(name[i]) !== vowels.has(name[i - 1])) count += 1;
  }
  return count;
}

export function scoreName(rawName: string): NameScores {
  const name = rawName.toLowerCase();
  const len = name.length;
  const vowelCount = [...name].filter((letter) => vowels.has(letter)).length;
  const ratio = vowelCount / Math.max(1, len);
  const transitionRatio = transitions(name) / Math.max(1, len - 1);
  const awkwardPenalty = awkward.some((chunk) => name.includes(chunk)) ? 25 : 0;
  const consonantCluster = /[^aeiouy]{4,}/.test(name) ? 18 : 0;

  const pronounceability = clamp(
    96 - Math.abs(ratio - 0.43) * 105 - Math.abs(transitionRatio - 0.72) * 35 - awkwardPenalty - consonantCluster,
  );

  const uniqueLetters = new Set(name).size / Math.max(1, len);
  const repeatedPenalty = /(.)\1{2,}/.test(name) ? 24 : /(.)\1/.test(name) ? 7 : 0;
  const lengthSweetSpot = Math.max(0, 1 - Math.abs(len - 7) / 8);
  const memorability = clamp(42 + lengthSweetSpot * 38 + uniqueLetters * 20 - repeatedPenalty);

  const rareLetterBoost = [...name].filter((letter) => "vxzkqj".includes(letter)).length * 5;
  const uniqueness = clamp(45 + uniqueLetters * 38 + rareLetterBoost - Math.max(0, len - 11) * 3);

  const endingBonus = familiarEndings.some((ending) => name.endsWith(ending)) ? 8 : 0;
  const brandability = clamp(
    pronounceability * 0.38 + memorability * 0.34 + uniqueness * 0.28 + endingBonus,
  );

  const total = clamp(
    pronounceability * 0.26 + memorability * 0.24 + uniqueness * 0.2 + brandability * 0.3,
  );

  return { pronounceability, memorability, uniqueness, brandability, total };
}
