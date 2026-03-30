



import { generateJWTToken_email, generateJWTToken_username } from "../utils/generateJWTToken.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";

dotenv.config();
const FRONTEND_URL = "https://skill-swap-five-chi.vercel.app";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

// ── Normal login — no prompt (smooth experience) ──
export const googleAuthHandler = (req, res, next) => {
  const options = { scope: ["profile", "email"] };

  // If fresh=true (after account deletion), force account picker
  if (req.query.fresh === "true") {
    options.prompt = "select_account";
  }

  passport.authenticate("google", options)(req, res, next);
};

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: `${FRONTEND_URL}/login`,
  session: false,
});

export const handleGoogleLoginCallback = asyncHandler(async (req, res) => {
  console.log("\n******** Inside handleGoogleLoginCallback function ********");

  const existingUser = await User.findOne({ email: req.user._json.email });

  if (existingUser) {
    // ── Check if banned ──
    if (existingUser.isBanned) {
      return res.redirect(`${FRONTEND_URL}/banned`);
    }

    const jwtToken = generateJWTToken_username(existingUser);
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    res.cookie("accessToken", jwtToken, {
      httpOnly: true, secure: false, sameSite: "lax", expires: expiryDate
    });
    return res.redirect(`${FRONTEND_URL}/discover`);
  }

  let unregisteredUser = await UnRegisteredUser.findOne({ email: req.user._json.email });
  if (!unregisteredUser) {
    console.log("Creating new Unregistered User");
    unregisteredUser = await UnRegisteredUser.create({
      name:    req.user._json.name,
      email:   req.user._json.email,
      picture: req.user._json.picture,
    });
  }

  const jwtToken = generateJWTToken_email(unregisteredUser);
  const expiryDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours for registration

  // ← Clear old accessToken to prevent conflicts
  res.clearCookie("accessToken");

  res.cookie("accessTokenRegistration", jwtToken, {
    httpOnly: true, secure: false, sameSite: "lax", expires: expiryDate
  });
  return res.redirect(`${FRONTEND_URL}/register`);
});

export const handleLogout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("accessTokenRegistration");
  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
};

export const emailSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
 
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }
 
  // Check if a fully-registered user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists. Please sign in.");
  }
 
  const hashedPassword = await bcrypt.hash(password, 12);
 
  // Create / update UnRegisteredUser so the /register flow can finish the profile
  let unregisteredUser = await UnRegisteredUser.findOne({ email });
  if (!unregisteredUser) {
    unregisteredUser = await UnRegisteredUser.create({
      name,
      email,
      picture: "", // no Google picture for email signups
      password: hashedPassword,
    });
  } else {
    // Update password in case they're retrying
    unregisteredUser.password = hashedPassword;
    unregisteredUser.name = name;
    await unregisteredUser.save();
  }
 
  const jwtToken = generateJWTToken_email(unregisteredUser);
  const expiryDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
 
  res.clearCookie("accessToken");
  res.cookie("accessTokenRegistration", jwtToken, {
    httpOnly: true,
    secure: true,
sameSite: "none",
    expires: expiryDate,
  });
 
  return res.status(201).json(new ApiResponse(201, null, "Account created. Complete your profile."));
});
 
 
// ── Email Login ───────────────────────────────────────────────────────────────
export const emailLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }
 
  const user = await User.findOne({ email });
 
  if (!user) {
    throw new ApiError(404, "No account found with this email. Please sign up first.");
  }
 
  if (!user.password) {
    // Account was created via Google — no password set
    throw new ApiError(400, "This account uses Google sign-in. Please continue with Google.");
  }
 
  if (user.isBanned) {
    throw new ApiError(403, "Your account has been banned.");
  }
 
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Incorrect password. Please try again.");
  }
 
  const jwtToken = generateJWTToken_username(user);
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
 
  res.cookie("accessToken", jwtToken, {
    httpOnly: true,
      secure: true,        // ✅ change
  sameSite: "none", 
    expires: expiryDate,
  });
 
  return res.status(200).json(
   new ApiResponse(200, { redirect: `${FRONTEND_URL}/discover` }, "Login successful.")
  );
});
 
