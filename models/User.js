import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "store_manager", "customer"], default: "customer" },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", default: null },
    refreshTokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ role: 1 });

// Reusing `models.User` avoids Mongoose's OverwriteModelError when Next.js
// hot-reloads this module in development.
export default models.User || model("User", userSchema);
