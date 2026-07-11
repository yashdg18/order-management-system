import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const productSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ storeId: 1 });
productSchema.index({ name: "text" });

export default models.Product || model("Product", productSchema);
