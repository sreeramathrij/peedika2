import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAlternatives
} from "../controllers/productController";
import { protect, restrict } from "../middleware/auth";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.get("/:id/alternatives", getAlternatives);

router.post("/", protect, restrict("admin"), createProduct);
router.put("/:id", protect, restrict("admin"), updateProduct);
router.delete("/:id", protect, restrict("admin"), deleteProduct);

export default router;
