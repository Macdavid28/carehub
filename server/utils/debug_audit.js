import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/admin.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";

dotenv.config();

const audit = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB for Audit");

    const admins = await Admin.find({});
    console.log(`\n--- ADMINS (${admins.length}) ---`);
    admins.forEach((a) =>
      console.log(`ID: ${a._id}, Name: ${a.name}, Email: ${a.email}`),
    );

    const doctors = await Doctor.find({});
    console.log(`\n--- DOCTORS (${doctors.length}) ---`);
    doctors.forEach((d) =>
      console.log(`ID: ${d._id}, Name: ${d.name}, Email: ${d.email}`),
    );

    const patients = await Patient.find({});
    console.log(`\n--- PATIENTS (${patients.length}) ---`);
    patients.forEach((p) =>
      console.log(`ID: ${p._id}, Name: ${p.name}, Email: ${p.email}`),
    );

    const appointments = await Appointment.find({});
    console.log(`\n--- APPOINTMENTS (${appointments.length}) ---`);
    appointments.forEach((a) => {
      console.log(`ID: ${a._id}, Status: ${a.status}`);
      console.log(`   Patient ID: ${a.patient}`);
      console.log(`   Doctor ID:  ${a.doctor}`);
    });

    process.exit();
  } catch (error) {
    console.error("Audit Failed", error);
    process.exit(1);
  }
};

audit();
