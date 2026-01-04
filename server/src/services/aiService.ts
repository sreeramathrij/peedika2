import { IProduct } from "../models/Product";

export const generateExplanation = (
  product: IProduct,
  score: number
): string => {
  const reasons: string[] = [];

  if (product.materials?.includes("recycled"))
    reasons.push("uses recycled materials");
  if (product.materials?.includes("organic"))
    reasons.push("is made from organic materials");
  if (product.packaging === "plastic")
    reasons.push("uses plastic packaging");
  if (product.shipping_type === "air")
    reasons.push("relies on air shipping");

  const reasonText =
    reasons.length > 0 ? reasons.join(", ") : "has limited sustainability data";

  return `This product has an eco-score of ${score}. It ${reasonText}.`;
};
