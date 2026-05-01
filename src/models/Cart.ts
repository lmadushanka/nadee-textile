import { Schema, model, models, type Types } from "mongoose";

export type CartItem = {
  productId: Types.ObjectId;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

export type CartDoc = {
  userId?: Types.ObjectId;
  guestId?: string;
  items: CartItem[];
};

const CartItemSchema = new Schema<CartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    selectedSize: { type: String },
    selectedColor: { type: String },
  },
  { _id: false },
);

const CartSchema = new Schema<CartDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      unique: true,
    },
    guestId: { type: String, sparse: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Cart = models.Cart ?? model<CartDoc>("Cart", CartSchema);
