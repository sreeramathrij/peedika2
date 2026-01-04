import type { Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";

// --- Utility to clean query values ---
const num = (v: any, fallback: number) =>
  isNaN(v) ? fallback : Number(v);

export const getProducts = async (req: Request, res: Response) => {
  const page = num(req.query.page, 1);
  const limit = num(req.query.limit, 12);
  const skip = (page - 1) * limit;

  const filters: any = {};

  if (req.query.category) filters.category = req.query.category;
  if (req.query.label) filters.ai_label = req.query.label;
  if (req.query.minScore) filters.eco_score = { $gte: Number(req.query.minScore) };
  if (req.query.maxPrice) filters.price = { $lte: Number(req.query.maxPrice) };

  let query = Product.find(filters);

  // sorting
  switch (req.query.sort) {
    case "eco_desc":
      query = query.sort({ eco_score: -1 });
      break;
    case "eco_asc":
      query = query.sort({ eco_score: 1 });
      break;
    case "price_asc":
      query = query.sort({ price: 1 });
      break;
    case "price_desc":
      query = query.sort({ price: -1 });
      break;
    default:
      query = query.sort({ createdAt: -1 });
  }

  const [products, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Product.countDocuments(filters)
  ]);

  res.json({
    page,
    total,
    pages: Math.ceil(total / limit),
    products
  });
};

export const getProduct = async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid id" });

  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Not found" });

  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const body = req.body;

  const product = await Product.create({
    ...body,
    eco_score: body.eco_score ?? 50,
    ai_label: body.ai_label ?? "medium",
    ai_confidence: body.ai_confidence ?? 0.5,
    ai_keywords: body.ai_keywords ?? { positive: [], negative: [] }
  });

  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const body = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    body,
    { new: true }
  );

  if (!product) return res.status(404).json({ message: "Not found" });

  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) return res.status(404).json({ message: "Not found" });

  res.json({ message: "Deleted" });
};

export const getAlternatives = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });

  const alternatives = await Product.find({
    category: product.category,
    eco_score: { $gt: product.eco_score },
    price: {
      $gte: product.price * 0.8,
      $lte: product.price * 1.2
    },
    _id: { $ne: product._id }
  })
    .sort({ eco_score: -1 })
    .limit(5);

  res.json({
    base: {
      id: product._id,
      name: product.name,
      eco_score: product.eco_score
    },
    alternatives: alternatives.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      eco_score: p.eco_score,
      improvementPercent: p.eco_score - product.eco_score
    }))
  });
};
