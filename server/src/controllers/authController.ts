import type { Request, Response } from "express";
import User from "../models/User";
import { createToken, sendTokenCookie } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already exists" });

  const user = await User.create({ name, email, password });

  const token = createToken(user._id.toString());
  sendTokenCookie(res, token);

  res.status(201).json({ user: { id: user._id, name, email } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return res.status(400).json({ message: "Invalid credentials" });

  const token = createToken(user._id.toString());
  sendTokenCookie(res, token);

  res.json({ user: { id: user._id, name: user.name, email } });
};

export const logout = async (_req: Request, res: Response) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.json({ message: "Logged out" });
};

export const getMe = async (req: any, res: Response) => {
  res.json({ user: req.user });
};
