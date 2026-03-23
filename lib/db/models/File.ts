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
  },
  { timestamps: true }
);

export const File =
  mongoose.models.File || mongoose.model("File", FileSchema);