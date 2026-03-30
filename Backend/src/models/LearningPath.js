import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:      String,
  username:  String,
  picture:   String,
  rating:    { type: Number, default: 0 },
  swapMatch: { type: Boolean, default: false },
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  phase:    Number,
  title:    String,
  duration: String,
  topics:   [String],
  reason:   String,
  skillTag: String,
  teachers: [teacherSchema],
}, { _id: false });

const learningPathSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail:     { type: String, index: true }, // ← allows fallback lookup after registration
  goal:          String,
  hoursPerWeek:  String,
  timeline:      String,
  currentLevel:  String,
  specificGoal:  String,
  generatedPath: [phaseSchema],
}, { timestamps: true });

export const LearningPath = mongoose.model("LearningPath", learningPathSchema);