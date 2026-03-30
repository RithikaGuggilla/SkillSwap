import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["request_received", "request_accepted", "session_scheduled", "session_reminder"],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
    link:    { type: String, default: "" }, // where to navigate on click
    meta:    { type: Object, default: {} }, // extra data (fromUser, sessionId etc)
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);