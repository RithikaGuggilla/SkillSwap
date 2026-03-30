import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import { generateJWTToken_username } from "../utils/generateJWTToken.js";
import { Request } from "../models/request.model.js";
import { Chat } from "../models/chat.model.js";
import { createNotification } from "./notification.controllers.js"; // ← ADD
import mongoose from "mongoose";

export const createRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside createRequest Controller function ********");

  const { receiverID } = req.body;
  const senderID = req.user._id;

  // check if already exists
  const existingRequest = await Request.findOne({
    sender: senderID,
    receiver: receiverID,
  });

  if (existingRequest) {
    throw new ApiError(400, "Request already exists");
  }

  // create new request
  const newRequest = await Request.create({
    sender: senderID,
    receiver: receiverID,
  });

  if (!newRequest) {
    return next(new ApiError(500, "Request not created"));
  }

  // notify receiver
  await createNotification({
    recipient: receiverID,
    type: "request_received",
    title: "New Skill Swap Request",
    message: `${req.user.name || req.user.username} wants to swap skills with you`,
    link: "/chats?tab=requests",
  });

  res.status(201).json(
    new ApiResponse(201, newRequest, "Request created successfully")
  );
});

export const getRequests = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside getRequests Controller function ********");

  const receiverID = req.user._id;

  const requests = await Request.find({
    receiver: receiverID,
    status: "Pending"
  }).populate("sender", "name username picture");

  const formattedRequests = requests.map((request) => ({
    _id: request._id, // ✅ IMPORTANT (this fixes your error)
    name: request.sender.name,
    username: request.sender.username,
    picture: request.sender.picture,
  }));

  return res.status(200).json(
    new ApiResponse(200, formattedRequests, "Requests fetched successfully")
  );
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside acceptRequest Controller function ********");

  const { requestId } = req.body;

  const receiverId = req.user._id;

  // ✅ get actual request
  const request = await Request.findById(requestId);

  if (!request) throw new ApiError(404, "Request not found");

  const senderId = request.sender;

  // ✅ check if chat already exists
  let chat = await Chat.findOne({
    users: { $all: [senderId, receiverId] }
  });

  // ✅ create chat if not exists
  if (!chat) {
    chat = await Chat.create({
      users: [senderId, receiverId],
      isGroupChat: false
    });
  }

  // ✅ update request
  await Request.findByIdAndUpdate(requestId, {
    status: "Connected"
  });

  // ✅ notification
  await createNotification({
    recipient: senderId,
    type: "request_accepted",
    title: "Request Accepted! 🎉",
    message: `${req.user.name || req.user.username} accepted your skill swap request`,
    link: "/chats",
  });

  res.status(201).json(
    new ApiResponse(201, chat, "Request accepted successfully")
  );
});


export const rejectRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside rejectRequest Controller function ********");

  const { requestId } = req.body;
  const senderId = req.user._id;

  const existingRequest = await Request.find({ sender: requestId, receiver: senderId, status: "Pending" });
  if (existingRequest.length === 0) throw new ApiError(400, "Request does not exist");

  await Request.findOneAndUpdate({ sender: requestId, receiver: senderId }, { status: "Rejected" });

  res.status(200).json(new ApiResponse(200, null, "Request rejected successfully"));
});

export const disconnectUser = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside disconnectUser Controller ********");

  const { username } = req.body;
  const currentUserId = req.user._id;

  const otherUser = await User.findOne({ username });
  if (!otherUser) throw new ApiError(404, "User not found");

  const otherUserId = otherUser._id;

  const connection = await Request.findOne({
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId },
    ],
    status: "Connected",
  });

  if (!connection) throw new ApiError(400, "Connection does not exist");

  await Request.deleteOne({ _id: connection._id });
  await Chat.deleteOne({ users: { $all: [currentUserId, otherUserId] } });

  res.status(200).json(new ApiResponse(200, null, "Disconnected successfully"));
});