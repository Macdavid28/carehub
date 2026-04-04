import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const createAppointment = async (req, res) => {
  try {
    const { doctor, doctorId, date, time, reason } = req.body;
    const targetDoctorId = doctor || doctorId;

    // req.user is the Patient document (from authMiddleware)
    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "Only patients can book appointments" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: targetDoctorId,
      date,
      time,
      reason,
      status: "Pending",
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all appointments (Admin) or specific to role
// @route   GET /api/appointments
// @access  Private
// @desc    Get all appointments (Admin) or specific to role
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let appointments;
    const user = req.user;
    console.log(
      `[GET /appointments] Request by: ${user.name} (${user._id}), Role: ${user.role}`,
    );

    if (user.role === "admin") {
      console.log(" -> Fetching ALL appointments (Admin)");
      appointments = await Appointment.find()
        .populate("patient", "name email contact")
        .populate("doctor", "name specialization");
    } else if (user.role === "doctor") {
      console.log(` -> Fetching appointments for Doctor: ${user._id}`);
      appointments = await Appointment.find({ doctor: user._id })
        .populate("patient", "name email contact profileImage")
        .populate("doctor", "name specialization");
    } else if (user.role === "patient") {
      console.log(` -> Fetching appointments for Patient: ${user._id}`);
      appointments = await Appointment.find({ patient: user._id })
        .populate("doctor", "name specialization profileImage fees")
        .populate("patient", "name email contact");
    }

    console.log(` -> Found ${appointments?.length || 0} appointments`);

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor/Admin)
// @desc    Update appointment status (Doctor/Admin) or Cancel/Reschedule (Patient)
// @route   PUT /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const user = req.user;

    // Admin: Full Access
    if (user.role === "admin") {
      if (status) appointment.status = status;
      if (date) appointment.date = date;
      if (time) appointment.time = time;
    }
    // Doctor: Can only update Status (Accept/Reject)
    else if (user.role === "doctor") {
      if (appointment.doctor.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (status) appointment.status = status;
    }
    // Patient: Can Cancel or Reschedule (if pending)
    else if (user.role === "patient") {
      if (appointment.patient.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      // Allow cancellation
      if (status === "Cancelled") {
        appointment.status = "Cancelled";
      }
      // Allow reschedule if status is Pending (or generally? user user said 'reschedule')
      if (date || time) {
        appointment.date = date || appointment.date;
        appointment.time = time || appointment.time;
        // If rescheduled, maybe reset status to Pending if it was Confirmed?
        // For now, let's keep it simple or reset to Pending.
        appointment.status = "Pending";
      }
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
