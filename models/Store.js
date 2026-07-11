import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const storeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default models.Store || model("Store", storeSchema);
