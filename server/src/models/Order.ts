import { Schema, model, Document, Types } from "mongoose";

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: {
    product: Types.ObjectId;
    quantity: number;
    pricePaid: number;
    eco_score: number;
  }[];

  totalAmount: number;
  discountApplied: number;
  ecoPointsEarned: number;
  ecoPointsRedeemed: number;
  storeCreditUsed: number;
  avgEcoScore: number;

  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },

    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        pricePaid: Number,
        eco_score: Number
      }
    ],

    totalAmount: Number,
    discountApplied: { type: Number, default: 0 },
    ecoPointsEarned: { type: Number, default: 0 },
    ecoPointsRedeemed: { type: Number, default: 0 },
    storeCreditUsed: { type: Number, default: 0 },
    avgEcoScore: Number
  },
  { timestamps: true }
);

export default model<IOrder>("Order", OrderSchema);
