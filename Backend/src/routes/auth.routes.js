

import { Router } from "express";
import {
  googleAuthCallback,
  googleAuthHandler,
  handleGoogleLoginCallback,
  handleLogout,
  emailLogin,    // ← new
  emailSignup,   // ← new
} from "../controllers/auth.controllers.js";

const router = Router();

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get("/google", googleAuthHandler);
router.get("/google/callback", googleAuthCallback, handleGoogleLoginCallback);

// ── Email / Password ──────────────────────────────────────────────────────────
router.post("/email/login", emailLogin);
router.post("/email/signup", emailSignup);

// ── Logout ────────────────────────────────────────────────────────────────────
router.get("/logout", handleLogout);

export default router;
