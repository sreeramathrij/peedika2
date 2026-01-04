import { Router } from "express";
import { copilot } from "../controllers/copilotController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, copilot);

export default router;