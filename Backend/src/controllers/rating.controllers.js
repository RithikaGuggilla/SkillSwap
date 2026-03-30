



import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Rating } from "../models/rating.model.js";
import { addXP, calculateSessionXP } from "../utils/creditEngine.js";

export const rateUser = asyncHandler(async (req, res) => {
  console.log("\n******** Inside rateUser Controller function ********");

  const { rating, description, username } = req.body;

  if (!rating || !description || !username) {
    throw new ApiError(400, "Please provide all the details");
  }

  const user = await User.findOne({ username });
  if (!user) throw new ApiError(400, "User not found");

  const rateGiver = req.user._id;

  const chat = await Chat.findOne({ users: { $all: [rateGiver, user._id] } });
  if (!chat) throw new ApiError(400, "Please connect first to rate the user");

  const rateExist = await Rating.findOne({ rater: rateGiver, username });
  if (rateExist) throw new ApiError(400, "You have already rated this user");

  const rate = await Rating.create({ rating, description, username, rater: rateGiver });
  if (!rate) throw new ApiError(500, "Rating not added");

  // ── Recalculate avg rating on the user's existing `rating` field ──
  const ratings = await Rating.find({ username });
  const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  await User.findByIdAndUpdate(user._id, { rating: avgRating });

  // ── Award XP to the rated user based on star rating ──
  // NOTE: We do NOT increment totalSessionsTaught here.
  // Sessions are tracked separately via the meeting/completion flow.
  const ratedUser = await User.findById(user._id);
  if (ratedUser) {
    const xpEarned   = calculateSessionXP(rating);
    const levelResult = addXP(ratedUser, xpEarned);

    // Update averageRating field for the credit profile display
    const prevTotal = ratedUser.averageRating * ratedUser.totalRatingsReceived;
    ratedUser.totalRatingsReceived += 1;
    ratedUser.averageRating = parseFloat(
      ((prevTotal + rating) / ratedUser.totalRatingsReceived).toFixed(2)
    );

    // +1 spendable credit per rating received
    ratedUser.credits = (ratedUser.credits || 0) + 1;

    // ✅ DO NOT increment totalSessionsTaught here — that happens in meeting.controller
    // when a meeting is marked as completed by both parties

    await ratedUser.save();

    if (levelResult.leveledUp) {
      console.log(`🎉 ${ratedUser.name} leveled up: ${levelResult.oldLevel} → ${levelResult.newLevel} ${ratedUser.badge}`);
    }
  }

  // ── Count as a session completed for the rater ──
  // This is the person who gave the rating — they attended a session
  await User.findByIdAndUpdate(rateGiver, {
    $inc: { totalSessionsCompleted: 1 },
  });

  res.status(200).json(new ApiResponse(200, rate, "Rating added successfully"));
});

// ── Get all reviews for a user ────────────────────────────
export const getReviews = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const ratings = await Rating.find({ username })
    .populate("rater", "name username picture")
    .sort({ createdAt: -1 });

  const reviews = ratings.map((r) => ({
    _id:              r._id,
    rating:           r.rating,
    comment:          r.description,
    createdAt:        r.createdAt,
    reviewerName:     r.rater?.name,
    reviewerUsername: r.rater?.username,
    reviewerPicture:  r.rater?.picture,
  }));

  return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched"));
});