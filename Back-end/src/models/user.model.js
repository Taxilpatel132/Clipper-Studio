import mongoose from "mongoose";
import argon2 from "argon2";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    device: {
      type: String
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
   
  name: {
    type: String,
   required: true,
   trim: true,
    minlength: 1
  },

   email: {
     type: String,
     unique: true,      
     required: true,    
     lowercase: true,    
     trim: true,
     match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
   },

    password: {
      type: String,
      required: true,
      select: false
    },

    refreshTokens: [refreshTokenSchema]
  },
  { timestamps: true }
);

/* Password hashing */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await argon2.hash(this.password);
 
});

/* Password verification */
userSchema.methods.verifyPassword = async function (plain) {
  return argon2.verify(this.password, plain);
};

export default mongoose.model("User", userSchema);
