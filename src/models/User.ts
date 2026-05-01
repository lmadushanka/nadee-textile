import { Schema, model, models } from "mongoose";

export type UserRole = "user" | "admin";

export type UserDoc = {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
};

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

export const User = models.User ?? model<UserDoc>("User", UserSchema);
