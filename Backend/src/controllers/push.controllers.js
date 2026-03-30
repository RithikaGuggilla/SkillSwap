// Backend/src/controllers/push.controllers.js
import { PushSubscription } from "../models/PushSubscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Save subscription when user allows notifications
export const saveSubscription = asyncHandler(async (req, res) => {
  const { subscription } = req.body;

  await PushSubscription.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, subscription },
    { upsert: true, new: true }
  );

  return res.status(200).json(new ApiResponse(200, {}, "Subscription saved"));
});

// Get public VAPID key (frontend needs this to subscribe)
export const getVapidKey = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { publicKey: process.env.VAPID_PUBLIC_KEY }, "VAPID key")
  );
});