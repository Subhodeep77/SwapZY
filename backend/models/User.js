const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    appwriteId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    college: {
      type: String,
      default: "",
      index: true,
    },
    contact: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN"],
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, isDeleted: 1 });

module.exports = mongoose.model("User", userSchema);
