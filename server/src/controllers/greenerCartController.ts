import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import Cart from "../models/Cart";
import Product from "../models/Product";
import User from "../models/User";
import { computeCartEcoScore } from "../services/cartScore";
import mongoose from "mongoose";

export const getGreenerCart = async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || !cart.items.length)
    return res.json({ suggestions: [], message: "Cart is empty" });

  const suggestions: any[] = [];

  for (const item of cart.items) {
    const current: any = item.product;

    if (!current) continue;

    // Find greener alternatives in same category
    const greener = await Product.find({
      category: current.category,
      eco_score: { $gt: current.eco_score },
      price: {
        $gte: current.price * 0.8,
        $lte: current.price * 1.2
      },
      _id: { $ne: current._id }
    })
      .sort({ eco_score: -1 })
      .limit(3);

    if (!greener.length) continue;

    suggestions.push({
      current: {
        id: current._id,
        name: current.name,
        price: current.price,
        eco_score: current.eco_score,
        quantity: item.quantity
      },
      alternatives: greener.map((g) => ({
        id: g._id,
        name: g.name,
        price: g.price,
        eco_score: g.eco_score,
        improvementPercent: g.eco_score - current.eco_score
      }))
    });
  }

  res.json({
    count: suggestions.length,
    suggestions
  });
};

export const swapCartItem = async (req: AuthRequest, res: Response) => {
  const { oldProductId, newProductId } = req.body;

  if (!mongoose.isValidObjectId(oldProductId) || !mongoose.isValidObjectId(newProductId))
    return res.status(400).json({ message: "Invalid product id" });

  // load cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  // find item in cart
  const oldItem = cart.items.find(
    (i) => i.product.toString() === oldProductId
  );
  if (!oldItem)
    return res.status(404).json({ message: "Product not in cart" });

  // lookup new product
  const newProduct = await Product.findById(newProductId);
  if (!newProduct)
    return res.status(404).json({ message: "Replacement product not found" });

  // ensure same category — UX fairness
  const oldProduct = await Product.findById(oldProductId);
  if (!oldProduct)
    return res.status(404).json({ message: "Original product missing" });

  if (oldProduct.category !== newProduct.category)
    return res.status(400).json({
      message: "Replacement must be from the same category"
    });

  // remove old & add new
  const quantity = oldItem.quantity;

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== oldProductId
  );

  cart.items.push({
    product: newProduct._id,
    quantity,
    lockedPrice: newProduct.price,
    eco_score_snapshot: newProduct.eco_score
  });

  // recalc cart score
  cart.cartEcoScore = computeCartEcoScore(cart);

  await cart.save();

  // Award eco-points bonus for swapping to greener product
  const ecoScoreImprovement = newProduct.eco_score - oldProduct.eco_score;
  let bonusPoints = 0;

  if (ecoScoreImprovement > 0) {
    bonusPoints = Math.floor(ecoScoreImprovement * 5); // 5 points per eco-score point improvement
    const user = await User.findById(req.user._id);
    if (user) {
      user.ecoPoints += bonusPoints;
      user.totalEcoPointsEarned += bonusPoints;
      await user.save();
    }
  }

  // Populate cart items with product details before returning
  await cart.populate('items.product');

  res.json({
    message: bonusPoints > 0
      ? `Item swapped! You earned ${bonusPoints} bonus eco-points! 🌿`
      : "Item swapped",
    cart,
    bonusPoints,
    ecoScoreImprovement
  });
};
