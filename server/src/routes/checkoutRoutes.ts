import { Router } from "express";
import {
  checkout,
  getEcoPoints,
  convertToStoreCredit,
  getOrderHistory,
  awardSwapBonus
} from "../controllers/checkoutController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

// Checkout
router.post("/", checkout);

// Eco-points
router.get("/eco-points", getEcoPoints);
router.post("/eco-points/convert", convertToStoreCredit);
router.post("/eco-points/swap-bonus", awardSwapBonus);

// Order history
router.get("/orders", getOrderHistory);

export default router;
