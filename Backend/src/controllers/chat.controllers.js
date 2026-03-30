import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";   // ← ADD THIS
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import { generateJWTToken_username } from "../utils/generateJWTToken.js";

export const createChat = asyncHandler(async (req, res) => {
  console.log("\n******** Inside createChat Controller function ********");

  const { users } = req.body;

  if (users.length === 0) {
    throw new ApiError(400, "Please provide all the details");
  }

  const chat = await Chat.create({ users });

  if (!chat) {
    throw new ApiError(500, "Error creating chat");
  }

  return res.status(200).json(new ApiResponse(200, chat, "Chat created successfully"));
});

export const getChats = asyncHandler(async (req, res) => {
  console.log("\n******** Inside getChat Controller function ********");

  const userId = req.user._id;

  const chats = await Chat.find({ users: userId })
    .populate("users", "username name picture")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  if (!chats) {
    throw new ApiError(500, "Error fetching chats");
  }

  // Add unread count for each chat
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: req.user._id },
        readBy: { $nin: [req.user._id] },
      });
      return { ...chat.toObject(), unreadCount };
    })
  );

  // ← was returning `chats` — now returns `chatsWithUnread`
  return res.status(200).json(new ApiResponse(200, chatsWithUnread, "Chats fetched successfully"));
});