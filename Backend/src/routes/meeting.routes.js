

import { Router } from "express";
import {
  scheduleMeeting,
  completeMeeting,
  getMyMeetings,
  markMissed,
} from "../controllers/meeting.controller.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.use(verifyJWT_username);

router.post("/schedule",               scheduleMeeting);
router.post("/complete/:meetingId",    completeMeeting);
router.post("/missed/:meetingId",      markMissed);
router.get("/my-meetings",             getMyMeetings);
router.get("/all",                     getMyMeetings);

export default router;