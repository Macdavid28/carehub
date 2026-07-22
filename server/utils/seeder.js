import "dotenv/config";
import bcryptjs from "bcryptjs";
import connectDB from "../config/db.js";
import Admin from "../models/admin.model.js";
import Department from "../models/department.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import MedicalRecord from "../models/medical_record.model.js";
import Prescription from "../models/prescription.model.js";

const DEFAULT_PASSWORD = "Password123!";

const seedDatabase = async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();

    console.log("Clearing existing data...");
    await Admin.deleteMany({});
    await Department.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Prescription.deleteMany({});

    console.log("Hashing default password...");
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(DEFAULT_PASSWORD, salt);

    // 1. Seed Admin
    console.log("Seeding Admin...");
    const adminEmail = process.env.EMAIL || "admin@carehub.com";
    const adminPassword = process.env.PASSWORD
      ? await bcryptjs.hash(process.env.PASSWORD, salt)
      : hashedPassword;

    const admin = await Admin.create({
      name: process.env.NAME || "System Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    // 2. Seed Departments
    console.log("Seeding Departments...");
    const departmentsData = [
      {
        name: "Cardiology",
        description: "Comprehensive cardiovascular care, diagnostics, and heart health management.",
        image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Neurology",
        description: "Expert diagnosis and treatment for brain, spinal cord, and nerve disorders.",
        image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Pediatrics",
        description: "Dedicated compassionate healthcare services for infants, children, and adolescents.",
        image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Orthopedics",
        description: "Advanced care for bone, joint, ligament, tendon, and muscle health.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Dermatology",
        description: "Specialized clinical and cosmetic treatments for skin, hair, and nail conditions.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
      },
    ];

    const departments = await Department.insertMany(departmentsData);

    // 3. Seed Doctors
    console.log("Seeding Doctors...");
    const doctorsData = [
      {
        name: "Dr. Sarah Jenkins",
        email: "doctor.cardio@carehub.com",
        password: hashedPassword,
        role: "doctor",
        specialization: "Cardiologist",
        department: departments[0]._id, // Cardiology
        qualification: "MD, FACC",
        experience: 12,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        availableTimeStart: "09:00",
        availableTimeEnd: "16:00",
        about: "Board-certified cardiologist specializing in preventive cardiology and heart failure management.",
        isVerified: true,
      },
      {
        name: "Dr. Robert Chen",
        email: "doctor.neuro@carehub.com",
        password: hashedPassword,
        role: "doctor",
        specialization: "Neurologist",
        department: departments[1]._id, // Neurology
        qualification: "MD, PhD",
        experience: 15,
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTimeStart: "10:00",
        availableTimeEnd: "17:00",
        about: "Leading neurologist with extensive research background in neurodegenerative disorders.",
        isVerified: true,
      },
      {
        name: "Dr. Emily Taylor",
        email: "doctor.peds@carehub.com",
        password: hashedPassword,
        role: "doctor",
        specialization: "Pediatrician",
        department: departments[2]._id, // Pediatrics
        qualification: "MBBS, DCH",
        experience: 8,
        availableDays: ["Tuesday", "Thursday", "Friday", "Saturday"],
        availableTimeStart: "08:30",
        availableTimeEnd: "15:00",
        about: "Passionate pediatrician focused on childhood growth, nutrition, and early development.",
        isVerified: true,
      },
      {
        name: "Dr. Marcus Vance",
        email: "doctor.ortho@carehub.com",
        password: hashedPassword,
        role: "doctor",
        specialization: "Orthopedic Surgeon",
        department: departments[3]._id, // Orthopedics
        qualification: "MS (Orthopedics), FRCS",
        experience: 14,
        availableDays: ["Monday", "Tuesday", "Thursday"],
        availableTimeStart: "09:00",
        availableTimeEnd: "17:00",
        about: "Specialist in sports injuries, arthroscopic surgery, and joint replacement procedures.",
        isVerified: true,
      },
    ];

    const doctors = await Doctor.insertMany(doctorsData);

    // Assign Department Heads
    await Department.findByIdAndUpdate(departments[0]._id, { head: doctors[0]._id });
    await Department.findByIdAndUpdate(departments[1]._id, { head: doctors[1]._id });
    await Department.findByIdAndUpdate(departments[2]._id, { head: doctors[2]._id });
    await Department.findByIdAndUpdate(departments[3]._id, { head: doctors[3]._id });

    // 4. Seed Patients
    console.log("Seeding Patients...");
    const patientsData = [
      {
        name: "John Doe",
        email: "patient.john@carehub.com",
        password: hashedPassword,
        role: "patient",
        gender: "Male",
        bloodGroup: "O+",
        contact: "+1 555-0192",
        address: "123 Maple Street, Springfield, IL",
        dateOfBirth: new Date("1988-04-12"),
        emergencyContact: {
          name: "Jane Doe",
          phone: "+1 555-0193",
          relation: "Spouse",
        },
        insurance: {
          provider: "BlueCross Health",
          policyNumber: "BC-9840219",
          expiryDate: new Date("2027-12-31"),
        },
        medicalHistory: ["Hypertension", "Dust Allergy"],
        isVerified: true,
      },
      {
        name: "Alice Smith",
        email: "patient.alice@carehub.com",
        password: hashedPassword,
        role: "patient",
        gender: "Female",
        bloodGroup: "A+",
        contact: "+1 555-0482",
        address: "456 Oak Avenue, Chicago, IL",
        dateOfBirth: new Date("1995-09-25"),
        emergencyContact: {
          name: "Mark Smith",
          phone: "+1 555-0483",
          relation: "Brother",
        },
        insurance: {
          provider: "Aetna LifeCare",
          policyNumber: "AET-330192",
          expiryDate: new Date("2026-10-15"),
        },
        medicalHistory: ["Asthma"],
        isVerified: true,
      },
      {
        name: "Michael Brown",
        email: "patient.michael@carehub.com",
        password: hashedPassword,
        role: "patient",
        gender: "Male",
        bloodGroup: "B-",
        contact: "+1 555-0723",
        address: "789 Pine Road, Evanston, IL",
        dateOfBirth: new Date("1976-11-03"),
        emergencyContact: {
          name: "Sarah Brown",
          phone: "+1 555-0724",
          relation: "Wife",
        },
        insurance: {
          provider: "UnitedHealthcare",
          policyNumber: "UHC-774012",
          expiryDate: new Date("2028-05-20"),
        },
        medicalHistory: ["Type 2 Diabetes"],
        isVerified: true,
      },
    ];

    const patients = await Patient.insertMany(patientsData);

    // 5. Seed Appointments
    console.log("Seeding Appointments...");
    const appointmentsData = [
      {
        patient: patients[0]._id, // John Doe
        doctor: doctors[0]._id, // Dr. Sarah Jenkins (Cardiology)
        date: new Date(Date.now() + 86400000 * 2), // 2 days from now
        time: "10:30 AM",
        reason: "Annual Cardiovascular Checkup",
        status: "Confirmed",
        notes: "Patient reported mild heart palpitations last week.",
      },
      {
        patient: patients[1]._id, // Alice Smith
        doctor: doctors[2]._id, // Dr. Emily Taylor (Pediatrics/General)
        date: new Date(Date.now() + 86400000 * 4), // 4 days from now
        time: "02:00 PM",
        reason: "Routine Wellness & Allergy Consultation",
        status: "Pending",
        notes: "Follow up on asthma medication efficiency.",
      },
      {
        patient: patients[2]._id, // Michael Brown
        doctor: doctors[1]._id, // Dr. Robert Chen (Neurology)
        date: new Date(Date.now() - 86400000 * 3), // 3 days ago
        time: "11:00 AM",
        reason: "Persistent Migraine Evaluation",
        status: "Completed",
        notes: "Prescribed headache management routine.",
      },
    ];

    await Appointment.insertMany(appointmentsData);

    // 6. Seed Medical Records
    console.log("Seeding Medical Records...");
    const medicalRecordsData = [
      {
        patient: patients[2]._id,
        doctor: doctors[1]._id,
        diagnosis: "Chronic Migraine Syndrome",
        symptoms: ["Severe unilateral headache", "Sensitivity to light", "Nausea"],
        vitals: {
          bloodPressure: "120/80 mmHg",
          heartRate: "72 bpm",
          temperature: "98.6 °F",
          weight: "78 kg",
        },
        notes: "Patient advised to reduce stress and track triggers in a daily symptom log.",
        visitDate: new Date(Date.now() - 86400000 * 3),
        status: "Active",
      },
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        diagnosis: "Mild Essential Hypertension",
        symptoms: ["Occasional dizziness", "Elevated resting BP"],
        vitals: {
          bloodPressure: "138/88 mmHg",
          heartRate: "78 bpm",
          temperature: "98.4 °F",
          weight: "84 kg",
        },
        notes: "Recommended low-sodium diet and daily 30-minute cardio exercises.",
        visitDate: new Date(Date.now() - 86400000 * 15),
        status: "Active",
      },
    ];

    await MedicalRecord.insertMany(medicalRecordsData);

    // 7. Seed Prescriptions
    console.log("Seeding Prescriptions...");
    const prescriptionsData = [
      {
        patient: patients[2]._id,
        doctor: doctors[1]._id,
        medication: "Sumatriptan 50mg",
        dosage: "50mg",
        frequency: "Once as needed during onset",
        duration: "30 days",
        instructions: "Take with water at the first sign of a migraine headache.",
        status: "Active",
        refillsRemaining: 2,
        startDate: new Date(Date.now() - 86400000 * 3),
      },
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        medication: "Lisinopril 10mg",
        dosage: "10mg",
        frequency: "Once daily in the morning",
        duration: "90 days",
        instructions: "Take regularly every morning. Avoid high potassium supplements.",
        status: "Active",
        refillsRemaining: 3,
        startDate: new Date(Date.now() - 86400000 * 15),
      },
    ];

    await Prescription.insertMany(prescriptionsData);

    console.log("\n==========================================");
    console.log("   DATABASE SEEDING COMPLETED SUCCESSFULLY   ");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error Seeding Database:", error);
    process.exit(1);
  }
};

seedDatabase();
