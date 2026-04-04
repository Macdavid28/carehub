// import crypto from "crypto";
// import Admin from "../models/admin.model.js";
// import Doctor from "../models/doctor.model.js";
// import Patient from "../models/patient.model.js";
// import generateToken from "../utils/generateToken.js";
// import {
//   sendVerificationEmail,
//   sendPasswordResetEmail,
//   sendResetSuccessEmail,
// } from "../email/email.js";

// // @desc    Register a new user (Default: Patient)
// // @route   POST /api/auth/register
// // @access  Public
// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check availability in all collections
//     const adminExists = await Admin.findOne({ email });
//     const doctorExists = await Doctor.findOne({ email });
//     const patientExists = await Patient.findOne({ email });

//     if (adminExists || doctorExists || patientExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Generate Verification Token
//     const verificationToken = Math.floor(
//       100000 + Math.random() * 900000,
//     ).toString();
//     const verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     const patient = await Patient.create({
//       name,
//       email,
//       password,
//       verificationToken,
//       verificationTokenExpires,
//     });

//     if (patient) {
//       try {
//         await sendVerificationEmail(
//           patient.name,
//           patient.email,
//           verificationToken,
//         );
//       } catch (emailError) {
//         console.error("Failed to send verification email:", emailError);
//         // Continue but warn client? Or fail? usually better to not fail registration if email fails, but let them resend.
//       }

//       res.status(201).json({
//         _id: patient._id,
//         name: patient.name,
//         email: patient.email,
//         role: "patient",
//         message:
//           "Registration successful. Please check your email to verify account.",
//       });
//     } else {
//       res.status(400).json({ message: "Invalid user data" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // @desc    Auth user & get token
// // @route   POST /api/auth/login
// // @access  Public
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check Admin
//     let user = await Admin.findOne({ email });
//     if (user && (await user.matchPassword(password))) {
//       const token = generateToken(res, user._id, "admin");
//       return res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: "admin",
//         profileImage: user.profileImage,
//         token,
//       });
//     }

//     // Check Doctor
//     user = await Doctor.findOne({ email });
//     if (user && (await user.matchPassword(password))) {
//       if (!user.isVerified) {
//         return res
//           .status(401)
//           .json({ message: "Please verify your email address" });
//       }
//       const token = generateToken(res, user._id, "doctor");
//       return res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: "doctor",
//         profileImage: user.profileImage,
//         token,
//       });
//     }

//     // Check Patient
//     user = await Patient.findOne({ email });
//     if (user && (await user.matchPassword(password))) {
//       if (!user.isVerified) {
//         return res
//           .status(401)
//           .json({ message: "Please verify your email address" });
//       }
//       const token = generateToken(res, user._id, "patient");
//       return res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: "patient",
//         profileImage: user.profileImage,
//         token,
//       });
//     }

//     res.status(401).json({ message: "Invalid email or password" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // @desc    Verify email
// // @route   POST /api/auth/verify-email
// // @access  Public
// export const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.body;

//     // We only verify patients and doctors for now (Admins verify manually or pre-verified)
//     let user = await Patient.findOne({
//       verificationToken: token,
//       verificationTokenExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       user = await Doctor.findOne({
//         verificationToken: token,
//         verificationTokenExpires: { $gt: Date.now() },
//       });
//     }

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpires = undefined;

//     await user.save();

//     res.json({ message: "Email verified successfully. You can now login." });
//   } catch (error) {
//     console.error("Verify Email Error:", error);
//     res.status(500).json({ message: "Server Error: " + error.message });
//   }
// };

// // @desc    Resend Verification Email
// // @route   POST /api/auth/resend-verification
// // @access  Public
// export const resendVerification = async (req, res) => {
//   try {
//     const { email } = req.body;

//     let user = await Patient.findOne({ email });
//     if (!user) {
//       user = await Doctor.findOne({ email });
//     }

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({ message: "Account already verified" });
//     }

//     const verificationToken = Math.floor(
//       100000 + Math.random() * 900000,
//     ).toString();
//     const verificationTokenExpires = Date.now() + 10 * 60 * 1000;

//     user.verificationToken = verificationToken;
//     user.verificationTokenExpires = verificationTokenExpires;

//     await user.save();
//     try {
//       await sendVerificationEmail(user.name, user.email, verificationToken);
//     } catch (err) {
//       console.error("Resend verification email failed:", err);
//       return res
//         .status(500)
//         .json({ message: "Failed to send email. Checks server logs." });
//     }

//     res.json({ message: "Verification email resent" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // @desc    Forgot Password
// // @route   POST /api/auth/forgot-password
// // @access  Public
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     console.log("Forgot password requested for:", email);

//     let user = await Admin.findOne({ email });
//     let modelType = "Admin";

//     if (!user) {
//       user = await Doctor.findOne({ email });
//       modelType = "Doctor";
//     }
//     if (!user) {
//       user = await Patient.findOne({ email });
//       modelType = "Patient";
//     }

//     if (!user) {
//       // Don't reveal user existence
//       return res.json({
//         message: "If that email exists, a reset link has been sent.",
//       });
//     }

//     const resetToken = crypto.randomBytes(20).toString("hex");
//     const resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordTokenExpires = resetTokenExpires;

//     await user.save();

//     // Construct Reset URL (Client Side Route)
//     const clientLink = process.env.CLIENT_LINK || "http://localhost:5173";
//     const resetUrl = `${clientLink}/reset-password/${resetToken}`;

//     console.log(
//       `Sending password reset email to ${email} (Role: ${modelType})`,
//     );

//     try {
//       await sendPasswordResetEmail(user.email, resetUrl);
//     } catch (emailError) {
//       console.error("Critical Error sending password reset email:", emailError);
//       // In this case, since we already saved the token, maybe we should rollback?
//       // Or just let it be. But we must return 500 so client knows email didn't go.
//       // Reverting token
//       user.resetPasswordToken = undefined;
//       user.resetPasswordTokenExpires = undefined;
//       await user.save();
//       return res.status(500).json({
//         message: "Failed to send email service. Please try again later.",
//       });
//     }

//     res.json({ message: "Password reset link sent to your email" });
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // @desc    Reset Password
// // @route   POST /api/auth/reset-password/:token
// // @access  Public
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     const query = {
//       resetPasswordToken: token,
//       resetPasswordTokenExpires: { $gt: Date.now() },
//     };

//     let user = await Admin.findOne(query);
//     if (!user) user = await Doctor.findOne(query);
//     if (!user) user = await Patient.findOne(query);

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.password = password; // Will be hashed by pre-save hook
//     user.resetPasswordToken = undefined;
//     user.resetPasswordTokenExpires = undefined;

//     await user.save();

//     try {
//       await sendResetSuccessEmail(user.email);
//     } catch (err) {
//       console.error("Failed to send reset success email", err);
//     }

//     res.json({ message: "Password reset successful" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // @desc    Get current user profile
// // @route   GET /api/auth/profile
// // @access  Private
// export const getUserProfile = async (req, res) => {
//   // req.user is already populated by middleware from the correct collection
//   try {
//     const user = req.user;

//     if (user) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         profileImage: user.profileImage,
//       });
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // @desc    Change Password
// // @route   POST /api/auth/change-password
// // @access  Private
// export const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     const user = req.user; // Populated by authMiddleware (Admin, Doctor, or Patient)

//     // Since req.user is an instance, we can't directly use matchPassword if it's missing from the object returned by findById
//     // But findById returns a document, so methods should be available.
//     // However, we did .select("-password") in middleware.
//     // We need to fetch password to compare.

//     let userWithPassword;
//     if (user.role === "admin")
//       userWithPassword = await Admin.findById(user._id);
//     else if (user.role === "doctor")
//       userWithPassword = await Doctor.findById(user._id);
//     else if (user.role === "patient")
//       userWithPassword = await Patient.findById(user._id);

//     if (!userWithPassword) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (await userWithPassword.matchPassword(currentPassword)) {
//       userWithPassword.password = newPassword;
//       await userWithPassword.save();
//       res.json({ message: "Password updated successfully" });
//     } else {
//       res.status(401).json({ message: "Invalid current password" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

import crypto from "crypto";
import bcryptjs from "bcryptjs";
import Admin from "../models/admin.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import generateToken from "../utils/generateToken.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendWelcomeEmail,
} from "../email/email.js";

// @desc    Register a new user (Default: Patient)
// @route   POST /api/auth/register
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check availability in all collections
    const adminExists = await Admin.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });
    const patientExists = await Patient.findOne({ email });

    if (adminExists || doctorExists || patientExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Password Validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    // Hash password manually (since hooks are removed)
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate Verification Token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
    });

    try {
      await sendVerificationEmail(
        patient.name,
        patient.email,
        verificationToken,
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify account.",
      user: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        role: "patient",
        bloodGroup: patient.bloodGroup,
        contact: patient.contact,
        gender: patient.gender,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    let user = null;
    let role = "";

    // Check Admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      user = admin;
      role = "admin";
    }

    // Check Doctor
    if (!user) {
      const doctor = await Doctor.findOne({ email });
      if (doctor) {
        user = doctor;
        role = "doctor";
      }
    }

    // Check Patient
    if (!user) {
      const patient = await Patient.findOne({ email });
      if (patient) {
        user = patient;
        role = "patient";
      }
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Verify Password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Verify Email (skip for Admin usually, but enforce for others)
    if (role !== "admin" && !user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Please verify your email address" });
    }

    const token = generateToken(res, user._id, role);

    // Send welcome email if first login? (Optional, skipping to avoid spam on every login)

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        profileImage: user.profileImage,
        bloodGroup: user.bloodGroup,
        contact: user.contact,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        specialization: user.specialization,
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // We only verify patients and doctors for now
    let user = await Patient.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      user = await Doctor.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    // Send Welcome Email
    try {
      if (sendWelcomeEmail) await sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      console.log("Welcome email failed", err);
    }

    res.json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
};

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await Patient.findOne({ email });
    if (!user) {
      user = await Doctor.findOne({ email });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();
    try {
      await sendVerificationEmail(user.name, user.email, verificationToken);
    } catch (err) {
      console.error("Resend verification email failed:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email." });
    }

    res.json({ success: true, message: "Verification email resent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await Doctor.findOne({ email });
      role = "doctor";
    }
    if (!user) {
      user = await Patient.findOne({ email });
      role = "patient";
    }

    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = resetTokenExpires;

    await user.save();

    const clientLink = process.env.CLIENT_LINK || "http://localhost:5173";
    const resetUrl = `${clientLink}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;
      await user.save();
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email." });
    }

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const query = {
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    };

    let user = await Admin.findOne(query);
    if (!user) user = await Doctor.findOne(query);
    if (!user) user = await Patient.findOne(query);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    await user.save();

    try {
      if (sendResetSuccessEmail) await sendResetSuccessEmail(user.email);
    } catch (err) {
      console.error("Failed to send reset success email", err);
    }

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bloodGroup: user.bloodGroup,
        contact: user.contact,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        medicalHistory: user.medicalHistory,
        emergencyContact: user.emergencyContact,
        insurance: user.insurance,
        specialization: user.specialization,
        qualification: user.qualification,
        experience: user.experience,
        about: user.about,
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // We must fetch the user with password field (it might be excluded in some queries,
    // but findById usually returns it unless excluded in schema.
    // Mongoose schema default select might be set?
    // Let's assume we need to fetch it to be safe, or just use what we have if authMiddleware attached it.
    // Actually authMiddleware usually attaches user without password if we did .select('-password').
    // So we need to re-fetch.

    let userWithPassword;
    if (user.role === "admin")
      userWithPassword = await Admin.findById(user._id);
    else if (user.role === "doctor")
      userWithPassword = await Doctor.findById(user._id);
    else if (user.role === "patient")
      userWithPassword = await Patient.findById(user._id);

    if (!userWithPassword) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcryptjs.compare(
      currentPassword,
      userWithPassword.password,
    );
    if (isMatch) {
      const salt = await bcryptjs.genSalt(10);
      userWithPassword.password = await bcryptjs.hash(newPassword, salt);
      await userWithPassword.save();
      res.json({ success: true, message: "Password updated successfully" });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid current password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req, res) => {
  try {
    const user = req.user; // from middleware
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          bloodGroup: user.bloodGroup,
          contact: user.contact,
          gender: user.gender,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Not authenticated" });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: "Error" });
  }
};

// Aliases to match routes usage if necessary,
// checking routes file: registerUser, loginUser needed?
// The previous file exported registerUser, loginUser.
// I should export them as aliases to avoid breaking routes file.

export const registerUser = signup;
export const loginUser = login;
