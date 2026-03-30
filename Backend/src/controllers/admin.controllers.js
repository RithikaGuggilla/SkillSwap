import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Report } from "../models/report.model.js";
import { Rating } from "../models/rating.model.js";
import { Meeting } from "../models/meeting.model.js";
import { Request } from "../models/request.model.js";
import jwt from "jsonwebtoken";

// ── Admin Login ──
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    email    !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const token = jwt.sign(
    { role: "admin", email },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.cookie("adminToken", token, {
    httpOnly: true, secure: false,
    sameSite: "lax",
    expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
  });

  return res.status(200).json(new ApiResponse(200, { email }, "Admin logged in"));
});

// ── Admin Logout ──
export const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie("adminToken");
  return res.status(200).json(new ApiResponse(200, null, "Logged out"));
});

// ── Platform Stats ──
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, bannedUsers, totalReports,
    pendingReports, totalSessions, totalRatings,
    totalConnections, newUsersThisWeek,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBanned: true }),
    Report.countDocuments(),
    Report.countDocuments({ status: "Pending" }),
    Meeting.countDocuments(),
    Rating.countDocuments(),
    Request.countDocuments({ status: "Connected" }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
  ]);

  // ── Monthly users (last 6 months) ──
  const monthlyUsers = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
      }
    },
    {
      $group: {
        _id: {
          year:  { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // ── Monthly reports (last 6 months) ──
  const monthlyReports = await Report.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
      }
    },
    {
      $group: {
        _id: {
          year:  { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // ── Monthly sessions (last 6 months) ──
  const monthlySessions = await Meeting.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
      }
    },
    {
      $group: {
        _id: {
          year:  { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Build last 6 months labels
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const last6 = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6.push({ month: MONTHS[d.getMonth()], year: d.getFullYear(), m: d.getMonth() + 1 });
  }

  const buildChart = (data) => last6.map(({ month, m, year }) => ({
    month,
    count: data.find(d => d._id.month === m && d._id.year === year)?.count || 0,
  }));

  return res.status(200).json(new ApiResponse(200, {
    totalUsers, bannedUsers, totalReports,
    pendingReports, totalSessions, totalRatings,
    totalConnections, newUsersThisWeek,
    charts: {
      users:    buildChart(monthlyUsers),
      reports:  buildChart(monthlyReports),
      sessions: buildChart(monthlySessions),
    }
  }, "Stats fetched"));
});

// ── Get All Users ──
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("name username email picture rating isBanned createdAt skillsProficientAt")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, users, "Users fetched"));
});

// ── Ban User ──
export const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await User.findByIdAndUpdate(userId, { isBanned: true });
  return res.status(200).json(new ApiResponse(200, null, "User banned"));
});

// ── Unban User ──
export const unbanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await User.findByIdAndUpdate(userId, { isBanned: false });
  return res.status(200).json(new ApiResponse(200, null, "User unbanned"));
});

// ── Delete User ──
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await User.findByIdAndDelete(userId);
  return res.status(200).json(new ApiResponse(200, null, "User deleted"));
});

// ── Get All Reports ──
export const getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate("reporter", "name username picture")
    .populate("reported", "name username picture isBanned")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, reports, "Reports fetched"));
});

// ── Resolve Report ──
export const resolveReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  await Report.findByIdAndUpdate(reportId, { status: "Resolved" });
  return res.status(200).json(new ApiResponse(200, null, "Report resolved"));
});

// ── Dismiss Report ──
export const dismissReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  await Report.findByIdAndUpdate(reportId, { status: "Dismissed" });
  return res.status(200).json(new ApiResponse(200, null, "Report dismissed"));
});