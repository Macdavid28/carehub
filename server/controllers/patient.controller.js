import Patient from "../models/patient.model.js";
import bcrypt from "bcryptjs";

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin/Doctor)
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-password");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select("-password");

    if (patient) {
      if (
        req.user.role === "admin" ||
        req.user.role === "doctor" ||
        (req.user.role === "patient" &&
          patient._id.toString() === req.user._id.toString())
      ) {
        res.json(patient);
      } else {
        res.status(403).json({ message: "Not authorized" });
      }
    } else {
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create patient profile (No longer strictly needed as register creates it, but maybe for Admin)
// @route   POST /api/patients
// @access  Private
// @desc    Create patient (Admin only)
// @route   POST /api/patients
// @access  Private/Admin
export const createPatientProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await Patient.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true, // Created by admin
    });

    if (patient) {
      res.status(201).json({
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        role: "patient",
      });
    } else {
      res.status(400).json({ message: "Invalid patient data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      if (
        req.user.role === "admin" ||
        patient._id.toString() === req.user._id.toString()
      ) {
        patient.name = req.body.name || patient.name;
        patient.dateOfBirth = req.body.dateOfBirth || patient.dateOfBirth;
        patient.gender = req.body.gender || patient.gender;
        patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
        patient.contact = req.body.contact || patient.contact;
        patient.address = req.body.address || patient.address;
        if (req.body.medicalHistory) {
          patient.medicalHistory = req.body.medicalHistory;
        }
        if (req.body.emergencyContact) {
          patient.emergencyContact = req.body.emergencyContact;
        }
        if (req.body.insurance) {
          patient.insurance = req.body.insurance;
        }

        const updatedPatient = await patient.save();
        res.json({
          ...updatedPatient._doc,
          password: null,
        }); // exclude password manualy or via select? _doc approach is hacky.
        // Better:
        // const { password, ...rest } = updatedPatient.toObject();
        // res.json(rest);
      } else {
        res.status(403).json({ message: "Not authorized" });
      }
    } else {
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get current user patient profile
// @route   GET /api/patients/me
// @access  Private
export const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id).select("-password");
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: "Patient profile not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
