import { Notification } from "../models/Notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// ── Get all notifications for current user ──
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  return res.status(200).json(
    new ApiResponse(200, { notifications, unreadCount }, "Notifications fetched")
  );
});

// ── Mark all as read ──
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } }
  );
  return res.status(200).json(new ApiResponse(200, {}, "Marked all as read"));
});

// ── Mark single as read ──
export const markOneRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  return res.status(200).json(new ApiResponse(200, {}, "Marked as read"));
});

// ── Delete a notification ──
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, {}, "Deleted"));
});

// ── Helper: create notification (used by other controllers) ──
export const createNotification = async ({ recipient, type, title, message, link = "", meta = {} }) => {
  try {
    const notif = await Notification.create({ recipient, type, title, message, link, meta });
    return notif;
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};