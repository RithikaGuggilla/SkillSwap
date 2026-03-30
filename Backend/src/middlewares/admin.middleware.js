// Backend/src/middlewares/admin.middleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.adminToken;
  if (!token) throw new ApiError(401, "Admin access required");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new ApiError(401, "Not authorized");

  req.admin = decoded;
  next();
});