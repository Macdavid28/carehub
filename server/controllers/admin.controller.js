import bcryptjs from "bcryptjs";
import Admin from "../models/admin.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Department from "../models/department.model.js";

// ─────────────────────────────────────────────
// ADMIN PROFILE
// ─────────────────────────────────────────────

// @desc    Get admin's own profile
// @route   GET /api/admin/profile
// @access  Private/Admin
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update admin's own profile (name, profileImage)
// @route   PUT /api/admin/profile
// @access  Private/Admin
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const { name, profileImage } = req.body;
    admin.name = name || admin.name;
    admin.profileImage = profileImage || admin.profileImage;

    const updated = await admin.save();
    const { password: _, ...adminData } = updated.toObject();
    res.json({ success: true, admin: adminData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private/Admin
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcryptjs.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcryptjs.genSalt(10);
    admin.password = await bcryptjs.hash(newPassword, salt);
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────
// USERS (AGGREGATED)
// ─────────────────────────────────────────────

// @desc    Get all users (doctors + patients) with role labels
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password")
      .populate("department", "name")
      .lean();

    const patients = await Patient.find().select("-password").lean();

    const doctorsWithRole = doctors.map((d) => ({ ...d, role: "doctor" }));
    const patientsWithRole = patients.map((p) => ({ ...p, role: "patient" }));

    res.json({
      success: true,
      total: doctorsWithRole.length + patientsWithRole.length,
      doctors: doctorsWithRole,
      patients: patientsWithRole,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────
// DOCTORS (Admin-level management)
// ─────────────────────────────────────────────

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
export const adminGetDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password")
      .populate("department", "name");
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create a doctor profile
// @route   POST /api/admin/doctors
// @access  Private/Admin
export const adminCreateDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      department,
      qualification,
      experience,
      // fees,
      gender,
      availableDays,
      availableTimeStart,
      availableTimeEnd,
      about,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !department ||
      !qualification ||
      !experience ||
      // !fees ||
      !gender
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, email, password, specialization, department, qualification, experience, and gender are required",
      });
    }

    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: "A doctor with this email already exists",
      });
    }

    // Check patient / admin collision too
    const patientExists = await Patient.findOne({ email });
    const adminExists = await Admin.findOne({ email });
    if (patientExists || adminExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another account",
      });
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
      // fees,
      gender,
      availableDays: availableDays || [],
      availableTimeStart,
      availableTimeEnd,
      about,
      isVerified: true, // admin-created accounts are pre-verified
    });

    const { password: _, ...doctorData } = doctor.toObject();
    res.status(201).json({ success: true, doctor: doctorData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update a doctor profile (admin override)
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
export const adminUpdateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const {
      name,
      specialization,
      department,
      qualification,
      experience,
      // fees,
      gender,
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
    // doctor.fees = fees !== undefined ? fees : doctor.fees;
    doctor.gender = gender || doctor.gender;
    doctor.availableDays = availableDays || doctor.availableDays;
    doctor.availableTimeStart = availableTimeStart || doctor.availableTimeStart;
    doctor.availableTimeEnd = availableTimeEnd || doctor.availableTimeEnd;
    doctor.about = about || doctor.about;
    doctor.profileImage = profileImage || doctor.profileImage;

    const updated = await doctor.save();
    const { password: _, ...doctorData } = updated.toObject();
    res.json({ success: true, doctor: doctorData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
export const adminDeleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    await Doctor.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Doctor removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────
// PATIENTS (Admin-level management)
// ─────────────────────────────────────────────

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private/Admin
export const adminGetPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-password");
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get a single patient by ID
// @route   GET /api/admin/patients/:id
// @access  Private/Admin
export const adminGetPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select("-password");
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create a patient account (admin-only, pre-verified)
// @route   POST /api/admin/patients
// @access  Private/Admin
export const adminCreatePatient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    const exists =
      (await Patient.findOne({ email })) ||
      (await Doctor.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    const { password: _, ...patientData } = patient.toObject();
    res.status(201).json({ success: true, patient: patientData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update a patient's profile (admin override)
// @route   PUT /api/admin/patients/:id
// @access  Private/Admin
export const adminUpdatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const {
      name,
      dateOfBirth,
      gender,
      bloodGroup,
      contact,
      address,
      medicalHistory,
      emergencyContact,
      insurance,
      profileImage,
    } = req.body;

    patient.name = name || patient.name;
    patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
    patient.gender = gender || patient.gender;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;
    patient.contact = contact || patient.contact;
    patient.address = address || patient.address;
    patient.profileImage = profileImage || patient.profileImage;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;
    if (emergencyContact !== undefined)
      patient.emergencyContact = emergencyContact;
    if (insurance !== undefined) patient.insurance = insurance;

    const updated = await patient.save();
    const { password: _, ...patientData } = updated.toObject();
    res.json({ success: true, patient: patientData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a patient (hard delete)
// @route   DELETE /api/admin/patients/:id
// @access  Private/Admin
export const adminDeletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    await Patient.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Patient removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────
// APPOINTMENTS (Admin-level management)
// ─────────────────────────────────────────────

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
export const adminGetAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    if (patientId) filter.patient = patientId;

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email contact profileImage")
      .populate("doctor", "name specialization profileImage department")
      .sort({ createdAt: -1 });

    res.json({ success: true, total: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update any appointment (admin override — status, date, time, notes)
// @route   PUT /api/admin/appointments/:id
// @access  Private/Admin
export const adminUpdateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const { status, date, time, notes } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (status) appointment.status = status;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (notes !== undefined) appointment.notes = notes;

    const updated = await appointment.save();
    res.json({ success: true, appointment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete an appointment
// @route   DELETE /api/admin/appointments/:id
// @access  Private/Admin
export const adminDeleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    await Appointment.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────
// STATS & ACTIVITY
// ─────────────────────────────────────────────

// @desc    Get enriched dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const adminGetStats = async (req, res) => {
  try {
    const [
      patientsCount,
      doctorsCount,
      appointmentsCount,
      departmentsCount,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Department.countDocuments({ isDeleted: false }),
      Appointment.countDocuments({ status: "Pending" }),
      Appointment.countDocuments({ status: "Confirmed" }),
      Appointment.countDocuments({ status: "Completed" }),
      Appointment.countDocuments({ status: "Cancelled" }),
    ]);

    res.json({
      success: true,
      stats: {
        patientsCount,
        doctorsCount,
        appointmentsCount,
        departmentsCount,
        appointmentStats: {
          pending: pendingCount,
          confirmed: confirmedCount,
          completed: completedCount,
          cancelled: cancelledCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get recent activity (latest appointments + newest users)
// @route   GET /api/admin/activity
// @access  Private/Admin
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [recentAppointments, recentDoctors, recentPatients] =
      await Promise.all([
        Appointment.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("patient", "name email")
          .populate("doctor", "name specialization"),
        Doctor.find().select("-password").sort({ createdAt: -1 }).limit(5),
        Patient.find().select("-password").sort({ createdAt: -1 }).limit(5),
      ]);

    res.json({
      success: true,
      activity: {
        recentAppointments,
        recentDoctors,
        recentPatients,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
