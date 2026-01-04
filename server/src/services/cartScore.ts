import type { ICart } from "../models/Cart";

export const computeCartEcoScore = (cart: ICart) => {
  if (!cart.items.length) return 0;

  const total = cart.items.reduce(
    (sum, i) => sum + (i.eco_score_snapshot || 0) * i.quantity,
    0
  );

  const qty = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return Math.round(total / qty);
};
