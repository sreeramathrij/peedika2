import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import type { Response } from "express";
import { StringValue } from "ms";

const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? "7d";

export const createToken = (id: string): string => {
  return jwt.sign(
    { id } as JwtPayload,
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES as StringValue
    }
  );
};

export const sendTokenCookie = (res: Response, token: string) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
