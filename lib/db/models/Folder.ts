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

    // Starred
    isStarred: {
      type: Boolean,
      default: false,
    },

    // Trash
    isTrashed: {
      type: Boolean,
      default: false,
    },

    trashedAt: {
      type: Date,
      default: null,
    },

    // Recent
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
FolderSchema.index({ userId: 1, parentId: 1 });
FolderSchema.index({ userId: 1, isTrashed: 1 });
FolderSchema.index({ userId: 1, isStarred: 1 });
FolderSchema.index({ userId: 1, lastAccessedAt: -1 });

export const Folder =
  mongoose.models.Folder || mongoose.model("Folder", FolderSchema);