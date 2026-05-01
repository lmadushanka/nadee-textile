import { Schema, model, models, type Types } from "mongoose";

export type OrderLine = {
  productId?: Types.ObjectId;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  selectedSize?: string;
  selectedColor?: string;
};

export type OrderDoc = {
  userId: Types.ObjectId;
  lines: OrderLine[];
  total: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  status: "placed" | "processing" | "shipped" | "cancelled";
};

const OrderLineSchema = new Schema<OrderLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, required: true },
    selectedSize: { type: String },
    selectedColor: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<OrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lines: { type: [OrderLineSchema], required: true },
    total: { type: Number, required: true },
    shippingName: { type: String, required: true },
    shippingPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    shippingCity: { type: String, required: true },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true },
);

export const Order = models.Order ?? model<OrderDoc>("Order", OrderSchema);
