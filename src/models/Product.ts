import { Schema, model, models, type Model } from "mongoose";

export type ProductDoc = {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  quantity: number;
  active: boolean;
  imageUrl: string;
  imageUrls: string[];
  featured: boolean;
};

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, default: true },
    imageUrl: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const existingProductModel = models.Product as Model<ProductDoc> | undefined;

// In Next.js dev (hot reload), Mongoose may keep an older compiled schema in
// memory. If the cached model misses newer paths, recreate it so writes keep
// all fields (sizes/colors/quantity/active/featured/imageUrls).
if (
  existingProductModel &&
  (!existingProductModel.schema.path("sizes") ||
    !existingProductModel.schema.path("colors") ||
    !existingProductModel.schema.path("quantity") ||
    !existingProductModel.schema.path("active") ||
    !existingProductModel.schema.path("featured") ||
    !existingProductModel.schema.path("imageUrls"))
) {
  delete models.Product;
}

export const Product =
  (models.Product as Model<ProductDoc> | undefined) ??
  model<ProductDoc>("Product", ProductSchema);
