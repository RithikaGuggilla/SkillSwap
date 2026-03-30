import { Router } from "express";
import {
  generateLearningPath,
  getLearningPath,
} from "../controllers/learningPath.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

// Both routes use verifyJWT_username — it handles registered + unregistered users
router.route("/generate").post(verifyJWT_username, generateLearningPath);
router.route("/get").get(verifyJWT_username, getLearningPath);
router.route("/regenerate").post(verifyJWT_username, generateLearningPath);

export default router;