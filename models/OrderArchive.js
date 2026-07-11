import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const orderArchiveItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderArchiveSchema = new Schema({
  originalOrderId: { type: Schema.Types.ObjectId, required: true, unique: true },
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderArchiveItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["PLACED", "PREPARING", "COMPLETED"], required: true },
  createdAt: { type: Date, required: true },
  archivedAt: { type: Date, default: Date.now },
});

orderArchiveSchema.index({ storeId: 1 });
orderArchiveSchema.index({ createdAt: -1 });

export default models.OrderArchive || model("OrderArchive", orderArchiveSchema);
