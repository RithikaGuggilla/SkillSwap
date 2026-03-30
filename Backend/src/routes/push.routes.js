
import { Router } from "express";
import { saveSubscription, getVapidKey } from "../controllers/push.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.get("/vapid-key",    getVapidKey);
router.post("/subscribe",   verifyJWT_username, saveSubscription);

export default router;