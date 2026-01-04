import type { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Cart from "../models/Cart";
import Order from "../models/Order";
import User from "../models/User";

/**
 * Eco-Points Calculation:
 * - Base points: 1 point per ₹10 spent
 * - Eco bonus: Additional points based on average eco-score
 *   - eco_score >= 80: 2x multiplier
 *   - eco_score >= 60: 1.5x multiplier
 *   - eco_score >= 40: 1.25x multiplier
 *   - eco_score < 40: 1x multiplier
 * 
 * Eco-Points Redemption:
 * - 100 eco-points = ₹10 discount
 * 
 * Store Credit:
 * - 500 eco-points can be converted to ₹100 store credit
 */

const ECO_POINTS_PER_RUPEE = 0.1; // 1 point per ₹10
const POINTS_TO_DISCOUNT_RATIO = 10; // 100 points = ₹10
const POINTS_TO_STORE_CREDIT_RATIO = 5; // 500 points = ₹100

const getEcoMultiplier = (avgEcoScore: number): number => {
  if (avgEcoScore >= 80) return 2;
  if (avgEcoScore >= 60) return 1.5;
  if (avgEcoScore >= 40) return 1.25;
  return 1;
};

// Get user's eco-points and store credit
export const getEcoPoints = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      ecoPoints: user.ecoPoints,
      storeCredit: user.storeCredit,
      totalEcoPointsEarned: user.totalEcoPointsEarned
    });
  } catch (error) {
    console.error("Get eco-points error:", error);
    return res.status(500).json({ message: "Failed to get eco-points" });
  }
};

// Convert eco-points to store credit
export const convertToStoreCredit = async (req: AuthRequest, res: Response) => {
  try {
    const { points } = req.body;
    
    if (!points || points < 500) {
      return res.status(400).json({ message: "Minimum 500 points required for conversion" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.ecoPoints < points) {
      return res.status(400).json({ message: "Insufficient eco-points" });
    }

    const pointsToConvert = Math.floor(points / 500) * 500; // Round down to nearest 500
    const storeCreditToAdd = (pointsToConvert / POINTS_TO_STORE_CREDIT_RATIO);

    user.ecoPoints -= pointsToConvert;
    user.storeCredit += storeCreditToAdd;
    await user.save();

    return res.json({
      message: `Converted ${pointsToConvert} eco-points to ₹${storeCreditToAdd} store credit`,
      ecoPoints: user.ecoPoints,
      storeCredit: user.storeCredit
    });
  } catch (error) {
    console.error("Convert to store credit error:", error);
    return res.status(500).json({ message: "Failed to convert eco-points" });
  }
};

// Checkout - place order instantly
export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const { useEcoPoints = 0, useStoreCredit = 0 } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate totals
    let subtotal = 0;
    let totalEcoScore = 0;
    const orderItems: any[] = [];

    for (const item of cart.items) {
      const product = item.product as any;
      const itemTotal = item.lockedPrice * item.quantity;
      subtotal += itemTotal;
      totalEcoScore += item.eco_score_snapshot * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        pricePaid: item.lockedPrice,
        eco_score: item.eco_score_snapshot
      });
    }

    const avgEcoScore = Math.round(totalEcoScore / cart.items.reduce((sum, item) => sum + item.quantity, 0));

    // Calculate discounts
    const maxEcoPointsDiscount = Math.min(
      useEcoPoints / POINTS_TO_DISCOUNT_RATIO,
      subtotal * 0.2, // Max 20% discount from eco-points
      user.ecoPoints / POINTS_TO_DISCOUNT_RATIO
    );
    const ecoPointsToRedeem = Math.floor(maxEcoPointsDiscount * POINTS_TO_DISCOUNT_RATIO);

    const maxStoreCreditDiscount = Math.min(
      useStoreCredit,
      subtotal - maxEcoPointsDiscount, // Apply after eco-points discount
      user.storeCredit
    );

    const totalDiscount = maxEcoPointsDiscount + maxStoreCreditDiscount;
    const finalAmount = subtotal - totalDiscount;

    // Calculate eco-points earned
    const basePoints = Math.floor(finalAmount * ECO_POINTS_PER_RUPEE);
    const multiplier = getEcoMultiplier(avgEcoScore);
    const ecoPointsEarned = Math.floor(basePoints * multiplier);

    // Create order
    const order = await Order.create({
      user: user._id,
      items: orderItems,
      totalAmount: finalAmount,
      discountApplied: totalDiscount,
      ecoPointsEarned,
      ecoPointsRedeemed: ecoPointsToRedeem,
      storeCreditUsed: maxStoreCreditDiscount,
      avgEcoScore
    });

    // Update user's eco-points and store credit
    user.ecoPoints = user.ecoPoints - ecoPointsToRedeem + ecoPointsEarned;
    user.storeCredit -= maxStoreCreditDiscount;
    user.totalEcoPointsEarned += ecoPointsEarned;
    await user.save();

    // Clear the cart
    cart.items = [];
    cart.cartEcoScore = 0;
    await cart.save();

    return res.json({
      message: "Order placed successfully!",
      order: {
        id: order._id,
        totalAmount: finalAmount,
        subtotal,
        discountApplied: totalDiscount,
        ecoPointsEarned,
        ecoPointsRedeemed: ecoPointsToRedeem,
        storeCreditUsed: maxStoreCreditDiscount,
        avgEcoScore,
        multiplier,
        itemCount: orderItems.length
      },
      user: {
        ecoPoints: user.ecoPoints,
        storeCredit: user.storeCredit,
        totalEcoPointsEarned: user.totalEcoPointsEarned
      }
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Failed to process checkout" });
  }
};

// Get user's order history
export const getOrderHistory = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    console.error("Get order history error:", error);
    return res.status(500).json({ message: "Failed to get order history" });
  }
};

// Award bonus eco-points (for swapping to greener products)
export const awardSwapBonus = async (req: AuthRequest, res: Response) => {
  try {
    const { ecoScoreImprovement } = req.body;
    
    if (!ecoScoreImprovement || ecoScoreImprovement <= 0) {
      return res.status(400).json({ message: "Invalid eco-score improvement" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Award 5 points per eco-score point improvement
    const bonusPoints = Math.floor(ecoScoreImprovement * 5);
    user.ecoPoints += bonusPoints;
    user.totalEcoPointsEarned += bonusPoints;
    await user.save();

    return res.json({
      message: `Earned ${bonusPoints} bonus eco-points for choosing a greener option!`,
      bonusPoints,
      ecoPoints: user.ecoPoints
    });
  } catch (error) {
    console.error("Award swap bonus error:", error);
    return res.status(500).json({ message: "Failed to award bonus" });
  }
};
