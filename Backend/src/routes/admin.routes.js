// Backend/src/routes/admin.routes.js
import { Router } from "express";
import {
  adminLogin, adminLogout, getStats,
  getAllUsers, banUser, unbanUser, deleteUser,
  getAllReports, resolveReport, dismissReport,
} from "../controllers/admin.controllers.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Public
router.post("/login",  adminLogin);
router.post("/logout", verifyAdmin, adminLogout);

// Protected
router.get("/stats",           verifyAdmin, getStats);
router.get("/users",           verifyAdmin, getAllUsers);
router.put("/users/:userId/ban",   verifyAdmin, banUser);
router.put("/users/:userId/unban", verifyAdmin, unbanUser);
router.delete("/users/:userId",    verifyAdmin, deleteUser);
router.get("/reports",             verifyAdmin, getAllReports);
router.put("/reports/:reportId/resolve",  verifyAdmin, resolveReport);
router.put("/reports/:reportId/dismiss",  verifyAdmin, dismissReport);

export default router;