import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
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
    medication: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    duration: {
      type: String, // e.g., "7 days", "1 month"
    },
    instructions: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Discontinued"],
      default: "Active",
    },
    isAmended: {
      type: Boolean,
      default: false,
    },
    amendedAt: {
      type: Date,
    },
    refillsRemaining: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
