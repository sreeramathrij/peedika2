import bcrypt from "bcrypt";
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  ecoPoints: number;
  storeCredit: number;
  totalEcoPointsEarned: number;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "user" },
    ecoPoints: { type: Number, default: 0 },
    storeCredit: { type: Number, default: 0 },
    totalEcoPointsEarned: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 🔐 hash password BEFORE save
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 compare method
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default model<IUser>("User", UserSchema);
