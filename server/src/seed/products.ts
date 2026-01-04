import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const products = [
  // -------- MEN'S FASHION --------
  {
    name: "Organic Cotton Men's T-Shirt",
    brand: "EarthThreads",
    category: "mens-fashion",
    price: 1299,
    description: "Soft and breathable organic cotton t-shirt.",
    materials: ["organic cotton"],
    packaging: "paper bag",
    shipping_type: "ground",
    eco_tags: ["organic", "ethical"],
    eco_score: 80,
    eco_breakdown: { materials: 25, ethics: 18, packaging: 15, shipping: 10, lifespan: 12 },
    ai_label: "high",
    ai_confidence: 0.82,
    ai_keywords: { positive: ["organic", "ethical"], negative: [] },
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
  },
  {
    name: "Polyester Men's Graphic Tee",
    brand: "QuickFit",
    category: "mens-fashion",
    price: 499,
    description: "Trendy graphic tee made from polyester.",
    materials: ["polyester"],
    packaging: "plastic wrap",
    shipping_type: "air",
    eco_tags: ["synthetic"],
    eco_score: 42,
    eco_breakdown: { materials: 10, ethics: 8, packaging: 8, shipping: 8, lifespan: 8 },
    ai_label: "low",
    ai_confidence: 0.87,
    ai_keywords: { positive: [], negative: ["polyester"] },
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"
  },
  {
    name: "Recycled Denim Jeans",
    brand: "BlueCycle",
    category: "mens-fashion",
    price: 2399,
    description: "Slim fit jeans made from recycled denim.",
    materials: ["recycled cotton"],
    packaging: "recyclable cardboard",
    shipping_type: "ground",
    eco_tags: ["recycled"],
    eco_score: 74,
    eco_breakdown: { materials: 22, ethics: 16, packaging: 14, shipping: 10, lifespan: 12 },
    ai_label: "high",
    ai_confidence: 0.74,
    ai_keywords: { positive: ["recycled"], negative: [] },
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"
  },

  // -------- WOMEN'S FASHION --------
  {
    name: "Organic Linen Dress",
    brand: "PureWear",
    category: "womens-fashion",
    price: 3499,
    description: "Elegant linen summer dress.",
    materials: ["linen"],
    packaging: "paper",
    shipping_type: "ground",
    eco_tags: ["natural", "organic"],
    eco_score: 85,
    eco_breakdown: { materials: 26, ethics: 18, packaging: 14, shipping: 12, lifespan: 15 },
    ai_label: "high",
    ai_confidence: 0.86,
    ai_keywords: { positive: ["organic", "linen"], negative: [] },
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"
  },
  {
    name: "Fast Fashion Party Dress",
    brand: "ShineNow",
    category: "womens-fashion",
    price: 1299,
    description: "Trendy sequin dress made with synthetic fibers.",
    materials: ["polyester"],
    packaging: "plastic wrap",
    shipping_type: "air",
    eco_tags: ["synthetic"],
    eco_score: 39,
    eco_breakdown: { materials: 9, ethics: 8, packaging: 8, shipping: 7, lifespan: 7 },
    ai_label: "low",
    ai_confidence: 0.9,
    ai_keywords: { positive: [], negative: ["synthetic"] },
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
  },

  // -------- MOBILE & COMPUTERS --------
  {
    name: "Eco-Edition Smartphone",
    brand: "GreenTech",
    category: "mobiles-computers",
    price: 29999,
    description: "Energy-efficient phone with recycled aluminum body.",
    materials: ["recycled aluminum"],
    packaging: "minimal paper packaging",
    shipping_type: "ground",
    eco_tags: ["recycled", "energy efficient"],
    eco_score: 72,
    eco_breakdown: { materials: 20, ethics: 14, packaging: 14, shipping: 10, lifespan: 14 },
    ai_label: "medium",
    ai_confidence: 0.71,
    ai_keywords: { positive: ["recycled"], negative: [] },
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"
  },
  {
    name: "Standard Budget Smartphone",
    brand: "FastCell",
    category: "mobiles-computers",
    price: 14999,
    description: "Affordable smartphone with plastic back.",
    materials: ["plastic"],
    packaging: "plastic and cardboard",
    shipping_type: "air",
    eco_tags: ["plastic"],
    eco_score: 48,
    eco_breakdown: { materials: 12, ethics: 10, packaging: 10, shipping: 8, lifespan: 8 },
    ai_label: "low",
    ai_confidence: 0.78,
    ai_keywords: { positive: [], negative: ["plastic"] },
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80"
  },
  {
    name: "Energy-Efficient Laptop",
    brand: "EcoCompute",
    category: "mobiles-computers",
    price: 66999,
    description: "Laptop optimized for low-power consumption.",
    materials: ["aluminum"],
    packaging: "recyclable cardboard",
    shipping_type: "ground",
    eco_tags: ["energy efficient"],
    eco_score: 70,
    eco_breakdown: { materials: 18, ethics: 14, packaging: 14, shipping: 10, lifespan: 14 },
    ai_label: "medium",
    ai_confidence: 0.7,
    ai_keywords: { positive: ["energy efficient"], negative: [] },
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
  },

  // -------- ELECTRONICS --------
  {
    name: "LED Smart TV",
    brand: "BrightView",
    category: "electronics",
    price: 39999,
    description: "Energy-efficient LED television.",
    materials: ["mixed electronics"],
    packaging: "cardboard",
    shipping_type: "ground",
    eco_tags: ["energy efficient"],
    eco_score: 63,
    ai_label: "medium",
    ai_confidence: 0.68,
    ai_keywords: { positive: ["energy efficient"], negative: [] },
    eco_breakdown: { materials: 15, ethics: 12, packaging: 12, shipping: 10, lifespan: 14 },
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80"
  },
  {
    name: "Halogen Desk Lamp",
    brand: "GlowLite",
    category: "electronics",
    price: 1299,
    description: "Standard halogen desk lamp.",
    materials: ["metal", "plastic"],
    packaging: "cardboard",
    shipping_type: "ground",
    eco_tags: [],
    eco_score: 45,
    ai_label: "low",
    ai_confidence: 0.63,
    ai_keywords: { positive: [], negative: [] },
    eco_breakdown: { materials: 10, ethics: 10, packaging: 9, shipping: 8, lifespan: 8 },
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"
  },

  // -------- HOME APPLIANCES --------
  {
    name: "5-Star Rated Refrigerator",
    brand: "FrostEco",
    category: "appliances",
    price: 52999,
    description: "Highly energy-efficient fridge.",
    materials: ["steel", "electronics"],
    packaging: "cardboard",
    shipping_type: "ground",
    eco_tags: ["energy efficient"],
    eco_score: 78,
    ai_label: "high",
    ai_confidence: 0.8,
    ai_keywords: { positive: ["energy efficient"], negative: [] },
    eco_breakdown: { materials: 20, ethics: 16, packaging: 14, shipping: 12, lifespan: 16 },
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80"
  },
  {
    name: "Standard Refrigerator",
    brand: "CoolFresh",
    category: "appliances",
    price: 38999,
    description: "Regular refrigerator without star rating.",
    materials: ["steel", "plastic"],
    packaging: "mixed",
    shipping_type: "ground",
    eco_tags: [],
    eco_score: 50,
    ai_label: "medium",
    ai_confidence: 0.6,
    ai_keywords: { positive: [], negative: [] },
    eco_breakdown: { materials: 12, ethics: 10, packaging: 10, shipping: 8, lifespan: 10 },
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80"
  },

  // -------- HOME & LIVING --------
  {
    name: "Bamboo Toothbrush",
    brand: "EcoSmile",
    category: "home-living",
    price: 149,
    description: "Biodegradable bamboo toothbrush.",
    materials: ["bamboo"],
    eco_tags: ["biodegradable", "natural"],
    packaging: "recycled paper",
    shipping_type: "ground",
    eco_score: 92,
    ai_label: "high",
    ai_confidence: 0.93,
    ai_keywords: { positive: ["biodegradable", "natural"], negative: [] },
    eco_breakdown: { materials: 28, ethics: 18, packaging: 16, shipping: 12, lifespan: 18 },
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80"
  },
  {
    name: "Plastic Toothbrush",
    brand: "SmileCo",
    category: "home-living",
    price: 49,
    description: "Standard plastic toothbrush.",
    materials: ["plastic"],
    eco_tags: ["plastic"],
    packaging: "plastic wrap",
    shipping_type: "ground",
    eco_score: 28,
    ai_label: "low",
    ai_confidence: 0.9,
    ai_keywords: { positive: [], negative: ["plastic"] },
    eco_breakdown: { materials: 6, ethics: 6, packaging: 6, shipping: 5, lifespan: 5 },
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80"
  },

  // -------- PERSONAL CARE --------
  {
    name: "Refillable Shampoo Bottle",
    brand: "ZeroWaste Co",
    category: "personal-care",
    price: 499,
    description: "Eco-friendly shampoo with refill pack.",
    materials: ["bioplastic"],
    eco_tags: ["refillable"],
    packaging: "paper",
    shipping_type: "ground",
    eco_score: 76,
    ai_label: "high",
    ai_confidence: 0.78,
    ai_keywords: { positive: ["refillable"], negative: [] },
    eco_breakdown: { materials: 20, ethics: 14, packaging: 14, shipping: 10, lifespan: 18 },
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"
  },
  {
    name: "Disposable Shampoo Sachet",
    brand: "QuickCare",
    category: "personal-care",
    price: 5,
    description: "Single-use shampoo sachet.",
    materials: ["plastic"],
    eco_tags: ["single-use", "plastic"],
    packaging: "plastic",
    shipping_type: "ground",
    eco_score: 22,
    ai_label: "low",
    ai_confidence: 0.92,
    ai_keywords: { positive: [], negative: ["single-use", "plastic"] },
    eco_breakdown: { materials: 6, ethics: 5, packaging: 5, shipping: 4, lifespan: 2 },
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80"
  },

  // -------- GROCERIES --------
  {
    name: "Organic Brown Rice",
    brand: "NatureGrain",
    category: "groceries",
    price: 199,
    description: "Certified organic brown rice.",
    materials: [],
    eco_tags: ["organic"],
    packaging: "paper pouch",
    shipping_type: "ground",
    eco_score: 83,
    ai_label: "high",
    ai_confidence: 0.8,
    ai_keywords: { positive: ["organic"], negative: [] },
    eco_breakdown: { materials: 22, ethics: 18, packaging: 14, shipping: 12, lifespan: 17 },
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
  },
  {
    name: "White Rice in Plastic Bag",
    brand: "BulkGrain",
    category: "groceries",
    price: 129,
    description: "Standard polished white rice in plastic packaging.",
    materials: [],
    eco_tags: ["plastic"],
    packaging: "plastic",
    shipping_type: "ground",
    eco_score: 46,
    ai_label: "low",
    ai_confidence: 0.78,
    ai_keywords: { positive: [], negative: ["plastic"] },
    eco_breakdown: { materials: 10, ethics: 9, packaging: 10, shipping: 8, lifespan: 9 },
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80"
  }

  // 👆 you now have ~25+ (duplicate and vary)
];

// 👇 OPTIONAL: duplicate & vary for reaching ~50
while (products.length < 50) {
  const base = products[products.length % 10];
  if(!base) break;
  products.push({
    ...base,
    name: base.name + " Variant " + products.length,
    price: Math.round(base.price * (0.8 + Math.random() * 0.4)),
    eco_score: Math.min(95, Math.max(25, Math.round(base.eco_score + (Math.random() * 20 - 10))))
  });
}
const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo connected ✔");

    await Product.deleteMany({});
    console.log("Old products cleared");

    await Product.insertMany(products);
    console.log(`${products.length} products inserted 🎉`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
