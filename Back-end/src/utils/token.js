import jwt from "jsonwebtoken";

export const generateTokens = (userId) => {
  if(!userId){
    throw new Error("User ID is required to generate tokens");
  }
  
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}