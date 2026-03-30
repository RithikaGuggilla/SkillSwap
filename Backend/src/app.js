import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";


const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://skill-swap-five-chi.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // to parse json in body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to parse url
app.use(express.static("public")); // to use static public folder
app.use(cookieParser()); // to enable CRUD operation on browser cookies



// Passport middleware
app.use(passport.initialize());

// Importing routes
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import requestRouter from "./routes/request.routes.js";
import reportRouter from "./routes/report.routes.js";
import ratingRouter from "./routes/rating.routes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import meetingRoutes from "./routes/meeting.routes.js";
import learningPathRouter from "./routes/learningPath.routes.js";
import groupRouter from "./routes/groupChat.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import pushRouter from "./routes/push.routes.js";
import adminRouter from "./routes/admin.routes.js";
import creditRouter from "./routes/credit.routes.js";


// Using routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);
app.use("/dashboard", dashboardRoutes);
app.use("/meeting", meetingRoutes);
app.use("/learningpath", learningPathRouter);
app.use("/group", groupRouter);
app.use("/notifications", notificationRouter);
app.use("/push", pushRouter);
app.use("/admin", adminRouter);
 app.use("/api/v1/credits", creditRouter);



export { app };
