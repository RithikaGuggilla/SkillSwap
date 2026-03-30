
import { Router } from "express";
import {
  getMyCreditProfile,
  getLeaderboard,
  getUserCreditProfile,
} from "../controllers/credit.controller.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

// Protected — must be logged in (uses same middleware as all other routes)
router.get("/me", verifyJWT_username, getMyCreditProfile);

// Public — no auth needed
router.get("/leaderboard", getLeaderboard);
router.get("/user/:identifier", getUserCreditProfile);

export default router;