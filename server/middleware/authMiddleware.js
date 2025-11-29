import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ----------------------------------------------------------
// AUTHENTICATE USER USING JWT
// ----------------------------------------------------------
export const protect = async (req, res, next) => {
  try {
    let token;

    // Token via Authorization header: "Bearer token"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(401).json({
        success: false,
        message: "User does not exist.",
      });

    // Check ban status
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account is banned. Contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

// ----------------------------------------------------------
// ROLE-BASED PROTECTION
// ----------------------------------------------------------
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission.",
      });

    next();
  };
};
