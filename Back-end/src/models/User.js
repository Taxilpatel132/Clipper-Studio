import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free"
    },
    refreshToken: {
     type: String,
      select: false
  }
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
    /* true → password is new or updated
     * false → password is unchanged 
     */
  if (!this.isModified("password")) return next();
  this.password = await argon2.hash(this.password);
  next();
});


userSchema.methods.verifyPassword = async function (password) {
  return argon2.verify(this.password, password);
};

export default mongoose.model("User", userSchema);
