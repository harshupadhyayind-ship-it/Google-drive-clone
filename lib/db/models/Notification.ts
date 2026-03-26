import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
    fromUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fromUserName: { type: String, default: "Someone" },
    type:         { type: String, default: "share" },
    message:      { type: String, required: true },
    itemName:     { type: String },
    itemType:     { type: String },
    read:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification =
  (mongoose.models.Notification as mongoose.Model<any>) ||
  mongoose.model("Notification", NotificationSchema);
