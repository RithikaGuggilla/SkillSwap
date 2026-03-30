import express from "express";
import {
  getDashboardStats,
  getActivity,
  getLearning,
  getDashboardOverview
} from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.get("/activity", protect, getActivity);
router.get("/learning", protect, getLearning);
router.get("/overview", verifyJWT_username, getDashboardOverview);

export default router;