import type { Request, Response } from "express";
import Product from "../models/Product";
import Cart from "../models/Cart";
import { detectIntent } from "../services/intent";
import { generateCopilotResponse } from "../services/llm";

import { getChatHistory, appendToChatHistory } from "../services/chatMemory";
import { AuthRequest } from "../middleware/auth";

export const copilot = async (req: AuthRequest, res: Response) => {
  const { message, productId } = req.body;
  const userId = req.user._id;
  await appendToChatHistory(userId, "user", message);

  const history = await getChatHistory(userId);

  const intent = detectIntent(message);
  switch (intent) {
    case "RECOMMEND":
      return recommendProducts(userId, message, res);

    case "CART_EVAL":
      return evaluateCart(userId, message, res);

    case "GREENER_ALTERNATIVES":
      return greenerSuggestions(userId, message, res, productId);

    case "PRODUCT_INFO":
      return explainProduct(userId, message, res, productId);

    default:
      // Try to find a product from the message and provide info
      return explainProduct(userId, message, res, productId);
  }
};

const recommendProducts = async (userId: string, message: string, res: Response) => {
  const priceMatch = message.match(/under\s?(\d+)/i);
  const priceLimit = priceMatch ? Number(priceMatch[1]) : undefined;

  const query: any = {};
  if (priceLimit) query.price = { $lte: priceLimit };

  const products = await Product.find(query)
    .sort({ eco_score: -1 })
    .limit(5);

  const structured = {
    type: "RECOMMEND",
    priceLimit,
    products: products.map(p => ({
      name: p.name,
      eco_score: p.eco_score,
      price: p.price,
      category: p.category,
      ai_label: p.ai_label
    }))
  };

  let aiMessage = "";
  try {
    aiMessage = await generateCopilotResponse(message, structured);
    await appendToChatHistory(userId, "assistant", aiMessage);
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    aiMessage = "Here are some great eco-friendly picks 🌿";
  }

  return res.json({
    intent: "RECOMMEND",
    products,
    aiMessage
  });
};

const evaluateCart = async (userId: string, message: string, res: Response) => {
  const cart = await Cart.findOne({ user: userId })
    .populate("items.product");

  if (!cart || !cart.items.length) {
    const emptyCartMessage = "Your cart is empty. Would you like me to recommend some eco-friendly products?";
    await appendToChatHistory(userId, "assistant", emptyCartMessage);
    return res.json({ intent: "CART_EVAL", aiMessage: emptyCartMessage });
  }

  const avg = cart.cartEcoScore;
  const items = cart.items as any[];

  const structured = {
    type: "CART_EVAL",
    cartEcoScore: avg,
    itemCount: items.length,
    items: items.map((item: any) => ({
      name: item.product?.name,
      eco_score: item.product?.eco_score,
      price: item.product?.price,
      quantity: item.quantity
    })),
    scoreCategory: avg >= 75 ? "excellent" : avg >= 50 ? "moderate" : "needs_improvement"
  };

  let aiMessage = "";
  try {
    aiMessage = await generateCopilotResponse(message, structured);
    await appendToChatHistory(userId, "assistant", aiMessage);
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    aiMessage = avg >= 75
      ? "Your cart is very eco-friendly! 🌍"
      : avg >= 50
      ? "Your cart is moderately eco-friendly. Want to improve it?"
      : "Your cart could be greener — I can suggest swaps 🌱";
  }

  return res.json({
    intent: "CART_EVAL",
    score: avg,
    items: structured.items,
    aiMessage
  });
};

const findProductFromMessage = async (message: string) => {
  const m = message.toLowerCase();
  
  // Remove common words that aren't useful for product matching
  const stopWords = ["the", "this", "that", "about", "what", "how", "why", "tell", "me", "more", "is", "are", "can", "you", "could", "would", "makes", "than", "others", "other", "sustainable", "eco", "friendly", "product", "item"];
  
  const words = m
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));

  if (words.length === 0) {
    // If no meaningful words, try to get the most recent/popular product
    return Product.findOne().sort({ createdAt: -1 });
  }

  // Try exact phrase match first
  let product = await Product.findOne({
    name: { $regex: words.join(".*"), $options: "i" }
  });

  if (product) return product;

  // Try matching any of the words
  product = await Product.findOne({
    $or: [
      { name: { $regex: words.join("|"), $options: "i" } },
      { category: { $regex: words.join("|"), $options: "i" } },
      { brand: { $regex: words.join("|"), $options: "i" } },
      { description: { $regex: words.join("|"), $options: "i" } }
    ]
  });

  return product;
};

const greenerSuggestions = async (userId: string, message: string, res: Response, productId?: string) => {
  // If productId is provided, use it directly; otherwise try to find from message
  let product = productId 
    ? await Product.findById(productId)
    : await findProductFromMessage(message);

  if (!product)
    return res.json({
      intent: "GREENER_ALTERNATIVES",
      aiMessage: "I couldn't match any product from your message. Try mentioning the product name 🌿"
    });

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

  const structured = {
    type: "GREENER_ALTERNATIVES",
    current: {
      name: product.name,
      eco_score: product.eco_score,
      price: product.price
    },
    alternatives: alternatives.map(p => ({
      name: p.name,
      eco_score: p.eco_score,
      price: p.price,
      improvement: p.eco_score - product.eco_score
    }))
  };

  let aiMessage = "";
  try {
    aiMessage = await generateCopilotResponse(message, structured);
    await appendToChatHistory(userId, "assistant", aiMessage);
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    aiMessage = "Here are some greener options 🌿";
  }
  

  return res.json({
    intent: "GREENER_ALTERNATIVES",
    ...structured,
    aiMessage
  });
};

const explainProduct = async (userId: string, message: string, res: Response, productId?: string) => {
  // If productId is provided, use it directly; otherwise try to find from message
  let product = productId 
    ? await Product.findById(productId)
    : await findProductFromMessage(message);

  if (!product)
    return res.json({
      intent: "PRODUCT_INFO",
      response: "I couldn't identify the product — try including its name 🙂"
    });

  const structured = {
    name: product.name,
    eco_score: product.eco_score,
    ai_label: product.ai_label,
    ai_confidence: product.ai_confidence,
    keywords: product.ai_keywords,
    breakdown: product.eco_breakdown
  };

  try {
    const aiMessage = await generateCopilotResponse(
      message,
      structured
    );
    await appendToChatHistory(userId, "assistant", aiMessage);
    return res.json({
      intent: "PRODUCT_INFO",
      product: structured,
      aiMessage
    });
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.json({
      fallback: true,
      aiMessage: "I had trouble generating a response, but here are the results 🙂",
      structured
    });
  }
};
