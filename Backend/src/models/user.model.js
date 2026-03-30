
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    // ── Email/password auth (optional — Google users won't have this) ──
    password: {
      type: String,
      default: null,   // null = Google-only account
    },

    picture: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToK4qEfbnd-RN82wdL2awn_PMviy_pelocqQ",
    },
    rating: {
      type: Number,
      default: 0,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    linkedinLink:  { type: String, default: "" },
    githubLink:    { type: String, default: "" },
    portfolioLink: { type: String, default: "" },
    skillsProficientAt: [{ type: String, default: "" }],
    skillsToLearn:      [{ type: String, default: "" }],
    education: [
      {
        institution:  { type: String, default: "" },
        degree:       { type: String, default: "" },
        startDate:    { type: Date,   default: null },
        endDate:      { type: Date,   default: null },
        score:        { type: Number, default: 0 },
        description:  { type: String, default: "" },
      },
    ],
    bio: { type: String, default: "" },
    projects: [
      {
        title:       { type: String, default: "" },
        description: { type: String, default: "" },
        projectLink: { type: String, default: "" },
        techStack:   [{ type: String, default: "" }],
        startDate:   { type: Date,   default: null },
        endDate:     { type: Date,   default: null },
        connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],

    // ── Credit & XP System ──────────────────────────────────────────────────
    xp:    { type: Number, default: 0 },
    level: {
      type: String,
      enum: ["Beginner", "Learner", "Explorer", "Achiever", "Pro", "Mentor", "Legend"],
      default: "Beginner",
    },
    badge:      { type: String, default: "🌱" },
    badgeColor: { type: String, default: "#94A3B8" },
    credits:                { type: Number, default: 0 },
    totalSessionsCompleted: { type: Number, default: 0 },
    totalSessionsTaught:    { type: Number, default: 0 },
    averageRating:          { type: Number, default: 0 },
    totalRatingsReceived:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);