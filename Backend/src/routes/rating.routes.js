import { Router } from "express";
import { rateUser, getReviews } from "../controllers/rating.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/rate",                    verifyJWT_username, rateUser);
router.get("/getReviews/:username",     verifyJWT_username, getReviews);

export default router;