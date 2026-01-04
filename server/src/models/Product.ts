import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;

  materials: string[];
  packaging: string;
  shipping_type: string;

  eco_tags: string[];

  eco_score: number;               // 0–100 rule score
  eco_breakdown: {
    materials: number;
    ethics: number;
    packaging: number;
    shipping: number;
    lifespan: number;
  };

  ai_label: "high" | "medium" | "low";
  ai_confidence: number;           // 0–1
  ai_keywords: {
    positive: string[];
    negative: string[];
  };

  image?: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    brand: String,
    category: { type: String, index: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },

    materials: [String],
    packaging: String,
    shipping_type: String,

    eco_tags: [String],

    eco_score: { type: Number, default: 50 },

    eco_breakdown: {
      materials: Number,
      ethics: Number,
      packaging: Number,
      shipping: Number,
      lifespan: Number
    },

    ai_label: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    ai_confidence: { type: Number, default: 0 },

    ai_keywords: {
      positive: [String],
      negative: [String]
    },

    image: String
  },
  { timestamps: true }
);

export default model<IProduct>("Product", ProductSchema);
