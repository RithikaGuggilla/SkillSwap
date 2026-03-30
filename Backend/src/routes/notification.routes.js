import { Router } from "express";
import {
  getNotifications, markAllRead, markOneRead, deleteNotification
} from "../controllers/notification.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();
router.use(verifyJWT_username);

router.get("/",              getNotifications);
router.put("/read-all",      markAllRead);
router.put("/:id/read",      markOneRead);
router.delete("/:id",        deleteNotification);

export default router;