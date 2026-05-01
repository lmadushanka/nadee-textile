import { Schema, model, models } from "mongoose";

export type CategoryDoc = {
  name: string;
  slug: string;
};

const CategorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const Category =
  models.Category ?? model<CategoryDoc>("Category", CategorySchema);
