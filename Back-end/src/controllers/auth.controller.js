
import { 
    signupUser,
    loginUser, 
    checkUserExists,
    rotateRefreshToken,
    logoutSession,
    logoutAllSessions
} from "../services/auth.service.js";


export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

   
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await checkUserExists(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const { user, accessToken, refreshToken } = await signupUser({ name, email, password, device: req.headers["user-agent"] });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "strict"
    });
    
    return res.status(201).json({
      message: "Signup successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
   
    try{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }
    const {user, accessToken, refreshToken } =await loginUser({email,password});
    if(!user){
        return res.status(401).json({message:"Invalid credentials"});
    }
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "strict"
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

    }catch(error){
          return res.status(500).json({
      message: error.message,
     
    })
}
}

export const refreshAccessToken = async (req, res) => {
  try {
    const oldToken = req.cookies?.refreshToken;

    const { accessToken, refreshToken } =
      await rotateRefreshToken(oldToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false // true in production
    });

    res.json({ accessToken });
  } catch (err) {
    if (err.message === "NO_TOKEN") {
      return res.status(401).json({ message: "No refresh token" });
    }

    if (err.message === "TOKEN_REUSE") {
      return res.status(403).json({ message: "Token reuse detected" });
    }

    return res.status(403).json({ message: "Invalid refresh token" });
  }
};


export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  await logoutSession(token);

  res.clearCookie("refreshToken");
  res.sendStatus(204);
};


export const logoutAll = async (req, res) => {
  await logoutAllSessions(req.user);

  res.clearCookie("refreshToken");
  res.sendStatus(204);
};
