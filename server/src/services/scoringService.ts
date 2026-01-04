import { IProduct } from "../models/Product";

export const calculateEcoScore = (product: IProduct): number => {
  let score = 50;

  if (product.materials?.includes("recycled")) score += 15;
  if (product.materials?.includes("organic")) score += 10;
  if (product.packaging === "plastic") score -= 10;
  if (product.shipping_type === "air") score -= 20;
  if (product.eco_tags?.includes("repairable")) score += 10;
  if (product.eco_tags?.includes("fair-trade")) score += 15;

  return Math.max(0, Math.min(100, score));
};