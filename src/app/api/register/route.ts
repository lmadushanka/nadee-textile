import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

function isRecord(e: unknown): e is Record<string, unknown> {
  return typeof e === "object" && e !== null;
}

function registerErrorMessage(e: unknown): string {
  if (isRecord(e)) {
    const code = e.code;
    const name = typeof e.name === "string" ? e.name : "";
    const msg = typeof e.message === "string" ? e.message : "";

    if (code === 11000 || name === "MongoServerError") {
      if (code === 11000) {
        return "An account with this email already exists.";
      }
    }

    if (
      name === "MongoServerSelectionError" ||
      msg.includes("querySrv") ||
      msg.includes("ETIMEOUT") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ENOTFOUND")
    ) {
      return (
        "Cannot reach the database. Check your internet connection, MongoDB " +
        "Atlas IP allowlist (Network Access), and MONGODB_URI in .env.local."
      );
    }

    if (name === "MongoServerError" && typeof msg === "string") {
      if (
        msg.includes("bad auth") ||
        msg.includes("authentication failed") ||
        msg.includes("Invalid namespace")
      ) {
        return "Database login failed. Check the username and password in MONGODB_URI.";
      }
    }

    if (name === "ValidationError" && e instanceof mongoose.Error.ValidationError) {
      const first = Object.values(e.errors)[0];
      if (first?.message) {
        return first.message;
      }
    }

    if (msg) {
      return msg;
    }
  }
  if (e instanceof Error && e.message) {
    return e.message;
  }
  return "Could not create account.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim();
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      email,
      passwordHash,
      name,
      role: "user",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);
    if (isRecord(e) && e.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    const message = registerErrorMessage(e);
    const status =
      message.includes("Cannot reach the database") ||
      message.includes("querySrv") ||
      message.includes("MongoServerSelectionError")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
