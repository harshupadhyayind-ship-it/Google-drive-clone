import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isVerified:              { type: Boolean, default: false },
    verificationToken:       { type: String,  select: false },
    verificationTokenExpiry: { type: Date,    select: false },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);