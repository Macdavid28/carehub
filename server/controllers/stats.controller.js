import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Department from "../models/department.model.js";

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private (Admin/Doctor)
export const getDashboardStats = async (req, res) => {
  try {
    const patientsCount = await Patient.countDocuments();
    const doctorsCount = await Doctor.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();
    const departmentsCount = await Department.countDocuments({
      isDeleted: false,
    });

    // Appointments by status
    const pendingAppointments = await Appointment.countDocuments({
      status: "Pending",
    });
    const confirmedAppointments = await Appointment.countDocuments({
      status: "Confirmed",
    });
    const completedAppointments = await Appointment.countDocuments({
      status: "Completed",
    });
    const cancelledAppointments = await Appointment.countDocuments({
      status: "Cancelled",
    });

    res.json({
      patientsCount,
      doctorsCount,
      appointmentsCount,
      departmentsCount,
      appointmentStats: {
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
