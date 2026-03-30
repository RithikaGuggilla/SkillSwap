
import mongoose, { Schema } from "mongoose";

const pushSubscriptionSchema = new Schema({
  user:         { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  subscription: { type: Object, required: true }, // stores endpoint + keys
}, { timestamps: true });

export const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);