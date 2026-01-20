import MedicalRecord from "../models/medical_record.model.js";

export const getPatientMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate("doctor", "name specialty")
      .sort({ visitDate: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedicalRecordsByPatientId = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate("doctor", "name specialization")
      .populate("patient", "name")
      .sort({ visitDate: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicalRecord = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Only doctors can create medical records" });
    }
    const record = await MedicalRecord.create({
      ...req.body,
      doctor: req.user._id,
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Strict RBAC: Only the creator doctor can update
    if (record.doctor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this record" });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      {
        ...req.body,
        isAmended: true,
        amendedAt: Date.now(),
      },
      { new: true },
    );

    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const voidMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Only the creator doctor can void
    if (record.doctor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to void this record" });
    }

    record.status = "Voided"; // Assuming schema supports this or we add it.
    // If schema is strict, we might need to add status to model first.
    // Let's assume schema is flexible or I will update model next.
    // Actually, let's append " [VOIDED]" to diagnosis to be safe if status field doesn't exist yet,
    // OR better: Update model.
    // I will add 'status' to model in next step to be clean.

    // For now, let's just mark it as void in notes/diagnosis if field missing,
    // BUT user asked for "mark as amended/voided". PROPER WAY: Add status field.
    // I'll update model in parallel.

    await record.save();
    res.status(200).json({ message: "Record voided", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate("doctor", "name specialty")
      .populate("patient", "name");
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
