import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import Button from "../components/ui/Button";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Activity,
  Plus,
  Pill,
} from "lucide-react";
import Modal from "../components/ui/Modal";
import MedicalRecordForm from "../components/forms/MedicalRecordForm";
import PrescriptionForm from "../components/forms/PrescriptionForm";
import useAuthStore from "../store/useAuthStore";
import { useState } from "react";

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: medicalRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["patientRecords", id],
    queryFn: async () => {
      const { data } = await axios.get(`/medical-records/patient/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["patientPrescriptions", id],
    queryFn: async () => {
      const { data } = await axios.get(`/prescriptions/patient/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const {
    data: patient,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      // We might need a specific endpoint or use existing.
      // Assuming GET /patients/:id exists and is accessible by admin
      const { data } = await axios.get(`/patients/${id}`);
      return data;
    },
  });

  if (isLoading || recordsLoading || prescriptionsLoading)
    return <div className="p-8">Loading patient details...</div>;
  if (error)
    return (
      <div className="p-8 text-red-600">Failed to load patient details</div>
    );

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setIsPrescriptionModalOpen(true);
  };

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setIsRecordModalOpen(true);
  };

  const handleAddPrescription = () => {
    setSelectedPrescription(null);
    setIsPrescriptionModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header / Hero Section */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-blue-500">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
        <div className="px-8 pb-8 py-4">
          <div className="relative flex flex-col md:flex-row items-end -mt-16 mb-4 gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg pointer-events-none">
              <div className="w-full h-full rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-5xl">
                {patient.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.name}
                </h1>
                {patient.isVerified && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-200">
                    Verified Patient
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="capitalize">
                    {patient.gender || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {patient.bloodGroup || "Blood Group N/A"}
                </div>
              </div>
            </div>
            {user?.role === "doctor" && (
              <div className="flex gap-3 pb-2">
                <Button variant="outline" onClick={handleAddPrescription}>
                  <Pill className="w-4 h-4 mr-2" />
                  Prescribe
                </Button>
                <Button onClick={handleAddRecord}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-100">
            {["overview", "medical_records", "prescriptions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Personal Info Grid */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <span className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">
                      Email
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {patient.email}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">
                      Phone
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {patient.contact || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">
                      Address
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {patient.address || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance & Emergency Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <h3 className="font-bold text-red-900 mb-4">
                    Emergency Contact
                  </h3>
                  {patient.emergencyContact ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-red-600 text-sm">Name</span>
                        <span className="font-medium text-red-900">
                          {patient.emergencyContact.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600 text-sm">Relation</span>
                        <span className="font-medium text-red-900">
                          {patient.emergencyContact.relation}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600 text-sm">Phone</span>
                        <span className="font-medium text-red-900">
                          {patient.emergencyContact.phone}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-500 italic text-sm">Not provided</p>
                  )}
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-4">Insurance</h3>
                  {patient.insurance ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-600 text-sm">Provider</span>
                        <span className="font-medium text-blue-900">
                          {patient.insurance.provider}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 text-sm">Policy #</span>
                        <span className="font-medium text-blue-900">
                          {patient.insurance.policyNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 text-sm">Expiry</span>
                        <span className="font-medium text-blue-900">
                          {patient.insurance.expiryDate
                            ? new Date(
                                patient.insurance.expiryDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-blue-500 italic text-sm">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical_records" && (
            <div className="space-y-4 animate-fadeIn">
              {medicalRecords?.map((record) => (
                <div
                  key={record._id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">
                        {record.diagnosis}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Activity className="w-3 h-3" />
                        <span>Dr. {record.doctor?.name || "Unknown"}</span>
                        <span className="mx-1">•</span>
                        <span>
                          {new Date(record.visitDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.isAmended && (
                        <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium border border-yellow-100">
                          Amended
                        </span>
                      )}
                      {user?.role === "doctor" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRecord(record)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {record.notes}
                  </p>

                  {record.labResults?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Lab Results
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {record.labResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-gray-900">
                              {result.testName}
                            </span>
                            <span className="text-primary-600 font-semibold">
                              {result.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(!medicalRecords || medicalRecords.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No medical records found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="space-y-4 animate-fadeIn">
              {prescriptions?.map((prescription) => (
                <div
                  key={prescription._id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md border-l-4 border-l-blue-500"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">
                        {prescription.medication}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {prescription.dosage} • {prescription.frequency} •{" "}
                        {prescription.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {prescription.isAmended && (
                        <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium border border-yellow-100">
                          Amended
                        </span>
                      )}
                      {user?.role === "doctor" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPrescription(prescription)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-blue-900 text-sm">
                    <span className="font-medium mr-2">Instructions:</span>
                    {prescription.instructions}
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Refills: {prescription.refillsRemaining}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Started:{" "}
                      {new Date(prescription.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!prescriptions || prescriptions.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Pill className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No prescriptions found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Stats (Visible on all tabs or specific tabs) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Total Visits</span>
                <span className="font-bold text-gray-900 text-lg">
                  {medicalRecords?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Prescriptions</span>
                <span className="font-bold text-gray-900 text-lg">
                  {prescriptions?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Last Visit</span>
                <span className="font-medium text-gray-900 text-sm">
                  {medicalRecords?.[0]
                    ? new Date(medicalRecords[0].visitDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Recent History Preview (Optional, consistent sidebar) */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="font-bold text-white mb-2">Patient Status</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">Active & Monitor</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Patient has been attending regular checkups. Maintain current
              prescription plan.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        title={selectedRecord ? "Edit Medical Record" : "Add Medical Record"}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      >
        <MedicalRecordForm
          patientId={id}
          initialData={selectedRecord}
          onSuccess={() => setIsRecordModalOpen(false)}
        />
      </Modal>

      <Modal
        title={selectedPrescription ? "Edit Prescription" : "Add Prescription"}
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      >
        <PrescriptionForm
          patientId={id}
          initialData={selectedPrescription}
          onSuccess={() => setIsPrescriptionModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default PatientDetailsPage;
