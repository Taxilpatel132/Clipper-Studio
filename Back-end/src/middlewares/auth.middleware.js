import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    /* 1️⃣ Get Authorization header */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token missing"
      });
    }

    /* 2️⃣ Extract token */
    const accessToken = authHeader.split(" ")[1];

    /* 3️⃣ Verify token */
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    /* 4️⃣ Load user */
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    /* 5️⃣ Attach user to request */
    req.user = user;

    /* 6️⃣ Continue */
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired access token"
    });
  }
};
