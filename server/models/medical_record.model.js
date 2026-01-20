import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    symptoms: [String],
    vitals: {
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      weight: String,
    },
    labResults: [
      {
        testName: String,
        result: String,
        date: Date,
        fileUrl: String,
      },
    ],
    notes: {
      type: String,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String, // 'Active', 'Voided', 'Amended'
      default: "Active",
    },
    isAmended: {
      type: Boolean,
      default: false,
    },
    amendedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;
