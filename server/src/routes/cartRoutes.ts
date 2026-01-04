import { Router } from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart
} from "../controllers/cartController";
import { getGreenerCart, swapCartItem } from "../controllers/greenerCartController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

// Greener cart routes (must come before base routes to avoid conflicts)
router.get("/greener", getGreenerCart);
router.post("/swap", swapCartItem);

// Base cart routes
router.get("/", getCart);
router.post("/", addToCart);
router.patch("/", updateQuantity);
router.delete("/:productId", removeItem);
router.delete("/", clearCart);

export default router;
