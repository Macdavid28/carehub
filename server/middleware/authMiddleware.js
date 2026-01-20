import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Determine which collection to query based on the role in the token
      if (decoded.role === "admin") {
        req.user = await Admin.findById(decoded.id).select("-password");
      } else if (decoded.role === "doctor") {
        req.user = await Doctor.findById(decoded.id).select("-password");
      } else if (decoded.role === "patient") {
        req.user = await Patient.findById(decoded.id).select("-password");
      } else {
        return res
          .status(401)
          .json({ message: "Not authorized, invalid role" });
      }

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
