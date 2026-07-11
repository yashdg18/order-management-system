import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["PLACED", "PREPARING", "COMPLETED"], default: "PLACED" },
  },
  { timestamps: true }
);

orderSchema.index({ storeId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });

export default models.Order || model("Order", orderSchema);
