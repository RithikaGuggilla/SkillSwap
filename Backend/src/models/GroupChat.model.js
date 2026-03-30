import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:      { type: String, required: true },
  readBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const groupChatSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  picture:   { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admins:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages:  [groupMessageSchema],
  lastMessage: {
    text:   { type: String, default: "" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at:     { type: Date },
  },
}, { timestamps: true });

export const GroupChat = mongoose.model("GroupChat", groupChatSchema);