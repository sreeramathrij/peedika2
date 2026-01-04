import type { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import type { AuthRequest } from "../middleware/auth";
import { computeCartEcoScore } from "../services/cartScore";
import mongoose from "mongoose";

export const getCart = async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product");

  res.json(cart ?? { items: [], cartEcoScore: 0 });
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  if (!mongoose.isValidObjectId(productId))
    return res.status(400).json({ message: "Invalid product id" });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: []
    });
  }

  const existing = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      lockedPrice: product.price,
      eco_score_snapshot: product.eco_score
    });
  }

  cart.cartEcoScore = computeCartEcoScore(cart);

  await cart.save();
  await cart.populate("items.product");

  res.status(201).json(cart);
};

export const updateQuantity = async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (!item) return res.status(404).json({ message: "Item not found" });

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );
  } else {
    item.quantity = quantity;
  }

  cart.cartEcoScore = computeCartEcoScore(cart);
  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
};

export const removeItem = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  // Remove the item from cart
  cart.items = cart.items.filter(
    (i) => i.product.toString() !== productId
  );

  cart.cartEcoScore = computeCartEcoScore(cart);
  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], cartEcoScore: 0 }
  );

  res.json({ message: "Cart cleared" });
};
