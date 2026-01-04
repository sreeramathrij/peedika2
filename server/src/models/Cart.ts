import { Schema, model, Document, Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  lockedPrice: number;
  eco_score_snapshot: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  cartEcoScore: number;
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
  lockedPrice: Number,
  eco_score_snapshot: Number
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    items: [CartItemSchema],
    cartEcoScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default model<ICart>("Cart", CartSchema);
