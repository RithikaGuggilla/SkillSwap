import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Report } from "../models/report.model.js";

export const createReport = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside createReport Controller function ********");
  const { username, reportedUsername, issue, issueDescription } = req.body;

  if (!username || !reportedUsername || !issue || !issueDescription) {
    return next(new ApiError(400, "Please fill all the details"));
  }

  const reporter = await User.findOne({ username });
  const reported = await User.findOne({ username: reportedUsername });

  if (!reporter || !reported) {
    return next(new ApiError(400, "User not found"));
  }

  // Prevent self-reporting
  if (reporter._id.toString() === reported._id.toString()) {
    return next(new ApiError(400, "You cannot report yourself"));
  }

  // Check if already reported
  const existingReport = await Report.findOne({
    reporter: reporter._id,
    reported: reported._id,
  });

  if (existingReport) {
    return next(new ApiError(400, "You have already reported this user"));
  }

  const report = await Report.create({
    reporter: reporter._id,
    reported: reported._id,
    nature: issue,
    description: issueDescription,
  });

  res.status(201).json(new ApiResponse(201, report, "User reported successfully"));
});