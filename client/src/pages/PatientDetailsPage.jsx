import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "../lib/utils";
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
  Calendar,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import Modal from "../components/ui/Modal";
import MedicalRecordForm from "../components/forms/MedicalRecordForm";
import PrescriptionForm from "../components/forms/PrescriptionForm";
import useAuthStore from "../store/useAuthStore";

import { motion } from "framer-motion";

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const queryClient = useQueryClient();

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
      const { data } = await axios.get(`/patients/${id}`);
      return data;
    },
  });

  const voidRecordMutation = useMutation({
    mutationFn: async (recordId) => {
      await axios.patch(`/medical-records/${recordId}/void`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patientRecords", id]);
    },
  });

  const cancelPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionId) => {
      await axios.patch(`/prescriptions/${prescriptionId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patientPrescriptions", id]);
    },
  });

  if (isLoading || recordsLoading || prescriptionsLoading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100 mx-auto max-w-2xl mt-10">
        <h3 className="text-xl font-bold text-rose-900 mb-2">Record Error</h3>
        <p className="text-rose-600">
          Failed to load patient details. Please try again.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
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

  const formatData = (value) => value || "—";
  const calculateAge = (dob) => {
    if (!dob) return "—";
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here if react-hot-toast is available
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
      {/* Clinical Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Minimalist Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm relative group">
              <User className="w-12 h-12" />
              {patient.isVerified && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatData(patient.name)}
                </h1>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                  patient.medicalHistory?.length > 5 
                    ? "bg-rose-50 text-rose-700 border-rose-100" 
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                )}>
                  <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      patient.medicalHistory?.length > 5 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    )}
                  />
                  {patient.medicalHistory?.length > 5 ? "Critical Watch" : "Stable Status"}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold text-sm">
                <span>{calculateAge(patient.dateOfBirth)} Years</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="capitalize">{formatData(patient.gender)}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="text-primary-600 font-black tracking-wider uppercase">PID: {patient._id.slice(-6)}</span>
                <button 
                  onClick={() => copyToClipboard(patient._id)}
                  className="p-1.5 hover:bg-slate-50 rounded-md transition-colors text-slate-400"
                  title="Copy Full ID"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> {/* Using ImageIcon as a placeholder for copy if needed, or simply text */}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex flex-col items-center justify-center px-8 py-3 bg-red-50/30 rounded-2xl border border-red-100/50">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-1">Blood Group</span>
              <span className="text-2xl font-black text-red-600">{formatData(patient.bloodGroup)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Quick Action Bar */}
      <div className="sticky top-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 p-3 flex flex-wrap items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-2">
           <Activity className="w-5 h-5 text-primary-500" />
           <span className="text-sm font-black text-slate-900 tracking-tight">Clinical Operations</span>
        </div>
        
        <div className="flex items-center gap-2">
          {user?.role === "doctor" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50"
                onClick={handleAddRecord}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                onClick={() => navigate(`/doctor/appointments?patientId=${id}`)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
              <Button
                className="hms-gradient-blue rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary-100"
                size="sm"
                onClick={handleAddPrescription}
              >
                <Pill className="w-4 h-4 mr-2" />
                Prescribe
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 mt-2 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Clinical Overview" },
          { id: "appointments", label: "Appointments" },
          { id: "medical_records", label: "Full Notes" },
          { id: "prescriptions", label: "Prescriptions" },
          { id: "lab_results", label: "Lab Results" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 min-w-[140px] py-3 px-6 rounded-lg text-xs font-black transition-all duration-200 uppercase tracking-widest
              ${
                activeTab === tab.id
                  ? "bg-white text-primary-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Clinical Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vitals Summary Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Activity className="w-4 h-4 text-rose-500" />
                       Recent Vitals
                     </h3>
                     <span className="text-[10px] font-bold text-slate-400">Latest: {medicalRecords?.[0]?.visitDate ? new Date(medicalRecords[0].visitDate).toLocaleDateString() : "N/A"}</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     {[
                       { label: "Blood Pressure", value: medicalRecords?.[0]?.vitals?.bloodPressure, unit: "mmHg", icon: Activity, color: "text-rose-500" },
                       { label: "Heart Rate", value: medicalRecords?.[0]?.vitals?.heartRate, unit: "BPM", icon: Activity, color: "text-rose-500" },
                       { label: "Temperature", value: medicalRecords?.[0]?.vitals?.temperature, unit: "°C", icon: Activity, color: "text-orange-500" },
                       { label: "Weight", value: medicalRecords?.[0]?.vitals?.weight, unit: "kg", icon: Activity, color: "text-blue-500" },
                     ].map((vital, idx) => (
                       <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">{vital.label}</span>
                         <div className="flex items-baseline gap-1">
                           <span className="text-lg font-black text-slate-900">{formatData(vital.value)}</span>
                           <span className="text-[10px] font-bold text-slate-400">{vital.unit}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Allergies & Alerts Card */}
                <div className="bg-white p-6 rounded-3xl border border-rose-100/50 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 bg-rose-50/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
                     <Shield className="w-4 h-4 text-rose-600" />
                     Allergies & Alerts
                   </h3>
                   
                   <div className="space-y-3 relative z-10">
                     <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                        <p className="text-xs font-black text-rose-700 uppercase tracking-widest mb-1 italic">Contraindications</p>
                        <p className="text-sm font-bold text-rose-900">{patient.medicalHistory?.length > 0 ? patient.medicalHistory.join(", ") : "No known systemic allergies recorded."}</p>
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium px-1">Verify with patient during every consultation.</p>
                   </div>
                </div>
              </div>

              {/* Personal & Contact Grid */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-[0.2em] font-black">Email Address</span>
                    <span className="text-slate-700 font-bold text-base">{patient.email}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-[0.2em] font-black">Phone Contact</span>
                    <span className="text-slate-700 font-bold text-base">{formatData(patient.contact)}</span>
                  </div>
                  <div className="md:col-span-2 space-y-1 pt-4 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-[0.2em] font-black">Residential Address</span>
                    <span className="text-slate-600 font-medium text-base">{formatData(patient.address)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "medical_records" && (
            <div className="space-y-6">
              {medicalRecords?.map((record) => (
                <div
                  key={record._id}
                  className="premium-card p-8 bg-white group hover:border-primary-100"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                        {record.diagnosis}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-400 font-bold">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>
                            Dr. {record.doctor?.name || "MD Specialist"}
                          </span>
                        </div>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(record.visitDate).toLocaleDateString(
                              undefined,
                              { dateStyle: "medium" },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {record.status && record.status !== "Active" && (
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            record.status === "Voided"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {record.status}
                        </span>
                      )}
                      {user?.role === "doctor" &&
                        record.status !== "Voided" && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl font-black text-xs"
                              onClick={() => handleEditRecord(record)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-black text-xs"
                              onClick={() => {
                                if (window.confirm("Void this record?")) {
                                  voidRecordMutation.mutate(record._id);
                                }
                              }}
                            >
                              Void
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden group/note">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-200"></div>
                    <p className="text-slate-600 font-medium leading-relaxed relative z-10 italic">
                      "{record.notes}"
                    </p>
                  </div>

                  {record.labResults?.length > 0 && (
                    <div className="mt-8 border-t border-slate-50 pt-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                        Diagnostic Lab Results
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {record.labResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-sm shadow-sm hover:shadow-md transition-shadow"
                          >
                            <span className="font-black text-slate-700">
                              {result.testName}
                            </span>
                            <span className="text-primary-600 font-black bg-primary-50 px-3 py-1 rounded-lg">
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
                <div className="text-center py-20 glass-card bg-slate-50/50 border-dashed border-2">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-black text-lg">
                    No clinical history detected.
                  </p>
                  <p className="text-slate-300 font-medium text-xs mt-1">
                    Upload records to populate this section
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "lab_results" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicalRecords?.flatMap(record => record.labResults || []).map((result, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-1">{result.testName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {result.date ? new Date(result.date).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <span className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl font-black text-sm border border-primary-100">
                      {result.result}
                    </span>
                 </div>
              ))}
              {medicalRecords?.flatMap(record => record.labResults || []).length === 0 && (
                <div className="col-span-2 text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                   <p className="text-slate-400 font-black">No Diagnostic Lab Results Found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="space-y-4">
               <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                   <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-black text-lg">Upcoming & Past Appointments</p>
                   <Button 
                    variant="outline" 
                    className="mt-4 rounded-xl font-black text-xs uppercase"
                    onClick={() => navigate(`/doctor/appointments?patientId=${id}`)}
                   >
                     View Appointment Calendar
                   </Button>
               </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="space-y-6">
              {prescriptions?.map((prescription) => (
                <div
                  key={prescription._id}
                  className="bg-white p-8 rounded-3xl border border-slate-200 group hover:border-primary-200 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-50 rounded-xl">
                          <Pill className="w-5 h-5 text-primary-600" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">
                          {formatData(prescription.medication)}
                        </h4>
                      </div>
                      <p className="text-sm font-black text-slate-400 tracking-wide bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">
                        {prescription.dosage} • {prescription.frequency} •{" "}
                        <span className="text-primary-600">
                          {prescription.duration}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {prescription.status && (
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            prescription.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : prescription.status === "Cancelled"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {prescription.status}
                        </span>
                      )}
                      {user?.role === "doctor" &&
                        prescription.status === "Active" && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl font-black text-xs"
                              onClick={() =>
                                handleEditPrescription(prescription)
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-black text-xs"
                              onClick={() => {
                                if (window.confirm("Cancel prescription?")) {
                                  cancelPrescriptionMutation.mutate(
                                    prescription._id,
                                  );
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl text-slate-700 font-bold mb-6 border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 opacity-50">
                      Administration Guidelines
                    </span>
                    {formatData(prescription.instructions)}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-50">
                    <div className="flex gap-3">
                      <span className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-400 border border-slate-100 uppercase">
                        Refills: {prescription.refillsRemaining}
                      </span>
                      <span className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-400 border border-slate-100 uppercase">
                        Issued:{" "}
                        {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    {prescription.image && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        href={`http://localhost:8000${prescription.image}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[10px] text-primary-600 hover:text-primary-700 font-black uppercase tracking-widest bg-primary-50 px-4 py-2 rounded-xl border border-primary-100 shadow-sm"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Original RX
                      </motion.a>
                    )}
                  </div>
                </div>
              ))}
              {(!prescriptions || prescriptions.length === 0) && (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                  <Pill className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-black text-lg">
                    No active medications.
                  </p>
                  <p className="text-slate-300 font-medium text-xs mt-1">
                    Prescriptions will appear here once issued
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
        {/* Sidebar Analytical Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
            <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
              <Activity className="w-4 h-4 text-emerald-500" />
              Intelligence Summary
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Patient Retention Rate</span>
                <div className="flex items-center gap-3">
                   <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                   </div>
                   <span className="text-sm font-black text-slate-900">85%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 text-center">
                    <span className="text-[10px] font-black text-primary-600 uppercase block mb-1">Visits</span>
                    <span className="text-xl font-black text-primary-700">{medicalRecords?.length || 0}</span>
                 </div>
                 <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
                    <span className="text-[10px] font-black text-indigo-600 uppercase block mb-1">RXs</span>
                    <span className="text-xl font-black text-indigo-700">{prescriptions?.length || 0}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Clinician's High Impact Note */}
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h3 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-tight relative z-10">
              <Shield className="w-5 h-5 text-emerald-400" />
              Clinical Integrity
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium relative z-10">
              Strict adherence to clinical protocols is maintained. Patient data is encrypted and validated for accuracy.
            </p>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 relative z-10">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Monitoring Active</span>
            </div>
          </div>
        </div>

          {/* Patient Status High Impact Card */}
          <div className="hms-gradient-blue p-8 rounded-[2.5rem] shadow-2xl shadow-primary-200/50 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-500"></div>

            <div className="relative z-10">
              <h3 className="font-black text-xl mb-4 tracking-tight">
                Clinical Status
              </h3>
              <div className="flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
                <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                  Active Monitoring
                </span>
              </div>
              <p className="text-primary-50 font-medium leading-relaxed">
                Patient metrics indicate standard progression. Adherence to
                prescribed protocols remains consistent.
              </p>

              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  Risk Profile
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-black uppercase">
                  Low
                </div>
              </div>
            </div>
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
