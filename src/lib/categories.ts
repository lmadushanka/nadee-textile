import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export type CategoryJSON = {
  _id: string;
  name: string;
  slug: string;
};

export async function getCategories(): Promise<CategoryJSON[]> {
  await connectDB();
  const rows = await Category.find({}).sort({ name: 1 }).lean().exec();
  return rows.map((r) => ({
    _id: String(r._id),
    name: String(r.name),
    slug: String(r.slug),
  }));
}
