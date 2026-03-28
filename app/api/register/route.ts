import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    // If already registered but not verified, resend the email
    if (!existing.isVerified) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.updateOne(
        { _id: existing._id },
        { verificationToken: token, verificationTokenExpiry: expiry }
      );
      await sendVerificationEmail(email, existing.name, token);
      return NextResponse.json({ message: "Verification email resent" }, { status: 200 });
    }
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate secure verification token (expires in 24h)
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
    isVerified: false,
    verificationToken,
    verificationTokenExpiry,
  });

  await sendVerificationEmail(email, name, verificationToken);

  return NextResponse.json({ message: "Please check your email to verify your account" });
}
