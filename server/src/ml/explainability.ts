import { POSITIVE_KEYWORDS, NEGATIVE_KEYWORDS } from "./keywords";

export interface KeywordEvidence {
  positive: string[];
  negative: string[];
}

export const extractKeywordEvidence = (text: string): KeywordEvidence => {
  const lower = text.toLowerCase();

  const positive = POSITIVE_KEYWORDS.filter(k =>
    lower.includes(k.toLowerCase())
  );

  const negative = NEGATIVE_KEYWORDS.filter(k =>
    lower.includes(k.toLowerCase())
  );

  return { positive, negative };
};

export const buildExplanation = (
  label: "high" | "medium" | "low",
  evidence: KeywordEvidence
): string => {

  if (label === "high") {
    return `This product is likely sustainable because it mentions: ${evidence.positive.join(
      ", "
    ) || "eco-friendly terms"}.`;
  }

  if (label === "low") {
    return `This product may have a higher environmental impact due to: ${evidence.negative.join(
      ", "
    ) || "several risk factors"}.`;
  }

  return `This product shows mixed signals${
    evidence.positive.length || evidence.negative.length
      ? ` — positive indicators: ${evidence.positive.join(
          ", "
        )}; concerns: ${evidence.negative.join(", ")}`
      : ""
  }.`;
};