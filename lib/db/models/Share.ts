import mongoose from "mongoose";

const ShareSchema = new mongoose.Schema(
  {
    // public shares only — sparse so null values don't conflict the unique index
    token: { type: String, default: undefined },

    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ["file", "folder"], required: true },
    itemName: { type: String, required: true },
    url: { type: String, default: null }, // file URL, null for folders

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // "public" = anyone with link, "user" = specific user
    shareType: { type: String, enum: ["public", "user"], required: true },

    // populated for shareType === "user"
    sharedWithUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

ShareSchema.index({ token: 1 }, { unique: true, sparse: true });
ShareSchema.index({ itemId: 1, shareType: 1 });
ShareSchema.index({ sharedWithUserId: 1 });

// Always delete the cached model so schema changes are picked up immediately.
delete (mongoose.models as any).Share;
export const Share = mongoose.model("Share", ShareSchema);

// Drop the old non-sparse token_1 index (if it exists) and recreate it as sparse.
// syncIndexes() compares current DB indexes against the schema and fixes mismatches.
// Errors are swallowed — the index may not exist yet on a fresh DB.
Share.syncIndexes().catch(() => {});
