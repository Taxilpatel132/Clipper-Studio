import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { generateTokens } from "../utils/token.js";


export const checkUserExists = async (email) => {
  const existingUser = await User.findOne({ email });
  return existingUser;
};

export const signupUser = async ({ name, email, password, device }) => {
  const user = new User({ name, email, password });

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshTokens.push({
    token: refreshToken,
    device
  });

  await user.save();

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ email, password, device="browser" }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) throw new Error("Invalid credentials");

  const valid = await user.verifyPassword(password);
  if (!valid) throw new Error("Invalid credentials");

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshTokens.push({
    token: refreshToken,
    device
  });

  await user.save();

  return { user, accessToken, refreshToken };
};


export const rotateRefreshToken = async (oldToken) => {
  if (!oldToken) {
    throw new Error("NO_TOKEN");
  }

  const payload = jwt.verify(
    oldToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(payload.id);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  
  const tokenIndex = user.refreshTokens.findIndex(
    (t) => t.token === oldToken
  );
/*
👉 Because this situation means a refresh token was stolen and reused.
👉 When that happens, we must assume the account is compromised.
👉 So we kill all sessions immediately.
 */
  if (tokenIndex === -1) {
    
    user.refreshTokens = [];
    await user.save();
    throw new Error("TOKEN_REUSE");
  }

  user.refreshTokens.splice(tokenIndex, 1);

  const { accessToken, refreshToken } = generateTokens(user._id);


  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  return {
    accessToken,
    refreshToken
  };
};




export const logoutSession = async (refreshToken) => {
  if (!refreshToken) return;

  const user = await User.findOne({
    "refreshTokens.token": refreshToken
  });

  if (!user) return;

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== refreshToken
  );

  await user.save();
};


export const logoutAllSessions = async (user) => {
  user.refreshTokens = [];
  await user.save();
};
