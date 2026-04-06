import Doctor from "../models/doctor.model.js";
import bcryptjs from "bcryptjs";

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password")
      .populate("department", "name");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select("-password")
      .populate("department", "name");

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a doctor profile (Admin only)
// @route   POST /api/doctors
// @access  Private/Admin
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      department,
      qualification,
      experience,
      availableDays,
      availableTimeStart,
      availableTimeEnd,
      about,
    } = req.body;

    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      department,
      qualification,
      experience,
      availableDays,
      availableTimeStart,
      availableTimeEnd,
      about,
      isVerified: true, // Created by admin, assume verified
    });

    res.status(201).json({
      success: true,
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: "doctor",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Admin or Owner)
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check permissions: Admin or the doctor themselves
    if (
      req.user.role !== "admin" &&
      doctor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      name,
      specialization,
      department,
      qualification,
      experience,
      availableDays,
      availableTimeStart,
      availableTimeEnd,
      about,
      profileImage,
    } = req.body;

    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.department = department || doctor.department;
    doctor.qualification = qualification || doctor.qualification;
    doctor.experience =
      experience !== undefined ? experience : doctor.experience;
    doctor.availableDays = availableDays || doctor.availableDays;
    doctor.availableTimeStart = availableTimeStart || doctor.availableTimeStart;
    doctor.availableTimeEnd = availableTimeEnd || doctor.availableTimeEnd;
    doctor.about = about || doctor.about;
    doctor.profileImage = profileImage || doctor.profileImage;

    const updatedDoctor = await doctor.save();
    const { password: _, ...doctorData } = updatedDoctor.toObject();
    res.json({ success: true, doctor: doctorData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
      await Doctor.deleteOne({ _id: req.params.id });
      res.json({ message: "Doctor removed" });
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
