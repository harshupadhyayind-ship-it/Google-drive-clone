import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
  },
  { timestamps: true }
);

// 🔥 Important for faster queries
FolderSchema.index({ userId: 1, parentId: 1 });

export const Folder =
  mongoose.models.Folder || mongoose.model("Folder", FolderSchema);