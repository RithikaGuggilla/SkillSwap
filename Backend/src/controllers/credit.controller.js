

import { User } from "../models/user.model.js";         
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getXPProgress, LEVELS } from "../utils/creditEngine.js";

// ── GET /api/v1/credits/me ──────────────────────────────────
const getMyCreditProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "name avatar xp level badge badgeColor credits totalSessionsCompleted totalSessionsTaught averageRating totalRatingsReceived"
  );

  if (!user) throw new ApiError(404, "User not found");

  const progress = getXPProgress(user.xp || 0, user.level || "Beginner");

  return res.status(200).json(
    new ApiResponse(200, {
      xp:                     user.xp                     || 0,
      level:                  user.level                  || "Beginner",
      badge:                  user.badge                  || "🌱",
      badgeColor:             user.badgeColor             || "#94A3B8",
      credits:                user.credits                || 0,
      totalSessionsCompleted: user.totalSessionsCompleted || 0,
      totalSessionsTaught:    user.totalSessionsTaught    || 0,
      averageRating:          user.averageRating          || 0,
      totalRatingsReceived:   user.totalRatingsReceived   || 0,
      progress,
      allLevels: LEVELS,
    }, "Credit profile fetched successfully")
  );
});

// ── GET /api/v1/credits/leaderboard ────────────────────────
const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .sort({ xp: -1 })
    .limit(20)
    .select("name avatar xp level badge badgeColor totalSessionsCompleted averageRating");

  return res.status(200).json(
    new ApiResponse(200, users, "Leaderboard fetched successfully")
  );
});

// ── GET /api/v1/credits/user/:identifier ───────────────────
// Accepts username string OR MongoDB _id
const getUserCreditProfile = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const selectFields =
    "name avatar xp level badge badgeColor credits totalSessionsCompleted totalSessionsTaught averageRating totalRatingsReceived";

  // 1️⃣ Try by username first
  let user = await User.findOne({ username: identifier }).select(selectFields);

  // 2️⃣ Fall back to _id
  if (!user) {
    const { default: mongoose } = await import("mongoose");
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier).select(selectFields);
    }
  }

  if (!user) throw new ApiError(404, "User not found");

  const progress = getXPProgress(user.xp || 0, user.level || "Beginner");

  return res.status(200).json(
    new ApiResponse(200, {
      ...user.toObject(),
      xp:                     user.xp                     || 0,
      level:                  user.level                  || "Beginner",
      badge:                  user.badge                  || "🌱",
      badgeColor:             user.badgeColor             || "#94A3B8",
      credits:                user.credits                || 0,
      totalSessionsCompleted: user.totalSessionsCompleted || 0,
      totalSessionsTaught:    user.totalSessionsTaught    || 0,
      averageRating:          user.averageRating          || 0,
      totalRatingsReceived:   user.totalRatingsReceived   || 0,
      progress,
      allLevels: LEVELS,
    }, "User credit profile fetched")
  );
});

export { getMyCreditProfile, getLeaderboard, getUserCreditProfile };