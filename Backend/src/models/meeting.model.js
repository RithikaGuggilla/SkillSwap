import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
{
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: String,
    required: true
  },

  time: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled"
  }

},
{ timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);