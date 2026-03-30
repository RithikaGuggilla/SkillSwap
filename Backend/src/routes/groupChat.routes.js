

import { Router } from "express";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  addMembers,
  removeMember,
  deleteGroup,
  updateGroup,
} from "../controllers/groupChat.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.use(verifyJWT_username);

router.post("/create",                       createGroup);
router.get("/my-groups",                     getMyGroups);
router.get("/:groupId/messages",             getGroupMessages);
router.post("/:groupId/send",                sendGroupMessage);
router.post("/:groupId/add-members",         addMembers);
router.put("/:groupId/update",               updateGroup);


router.delete("/:groupId/remove/:memberId",  removeMember);
router.delete("/:groupId",                   deleteGroup);

export default router;