import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    // Starred
    isStarred: {
      type: Boolean,
      default: false,
    },

    // Trash (soft delete)
    isTrashed: {
      type: Boolean,
      default: false,
    },

    trashedAt: {
      type: Date,
      default: null,
    },

    // Recent (last accessed/opened)
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for performance
FileSchema.index({ userId: 1, isTrashed: 1 });
FileSchema.index({ userId: 1, isStarred: 1 });
FileSchema.index({ userId: 1, lastAccessedAt: -1 });

export const File =
  mongoose.models.File || mongoose.model("File", FileSchema);
