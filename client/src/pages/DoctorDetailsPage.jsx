import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
// import useAuthStore from "../store/useAuthStore";
import Button from "../components/ui/Button";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Award,
  Briefcase,
  DollarSign,
} from "lucide-react";

const DoctorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: doctor,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const { data } = await axios.get(`/doctors/${id}`);
      return data;
    },
  });

  // const { user } = useAuthStore(); // Unused for now

  if (isLoading)
    return (
      <div className="p-8 flex justify-center text-primary-600">
        Loading doctor details...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg mx-auto max-w-2xl mt-8">
        <h3 className="font-bold">Error Loading Doctor</h3>
        <p>Could not fetch doctor details.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Modern Hero Header */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-primary-900 h-64"></div>

        <div className="relative pt-6 px-6">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="relative px-8 pb-8 flex flex-col md:flex-row items-end gap-8 pt-8">
          <div className="w-40 h-40 rounded-2xl bg-white p-1.5 shadow-xl translate-y-4">
            <div className="w-full h-full rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-6xl">
              {doctor.name.charAt(0)}
            </div>
          </div>

          <div className="flex-1 text-white pb-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                {doctor.specialization}
              </span>
              <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Top Rated</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">{doctor.name}</h1>
            <p className="text-indigo-200 text-lg">{doctor.qualification}</p>
          </div>

          <div className="mb-4">
            {/* Place for Action Button (Book Appointment) if Patient */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white min-w-[200px]">
              {/* <p className="text-xs text-indigo-200 uppercase tracking-widest font-semibold mb-1">
                Consultation Fee
              </p> */}
              {/* <p className="text-3xl font-bold flex items-center">
                <DollarSign className="w-6 h-6 text-green-400 mr-1" />
                {doctor.fees}
              </p> */}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pt-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-500" />
              About Dr. {doctor.name.split(" ")[1]}
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {doctor.about ||
                "Dr. " +
                  doctor.name +
                  " is a dedicated specialist in " +
                  doctor.specialization +
                  " with " +
                  doctor.experience +
                  " years of experience in providing quality healthcare."}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-gray-500 text-sm mb-1">
                  Experience
                </span>
                <span className="block text-2xl font-bold text-gray-900">
                  {doctor.experience}+ Years
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="block text-gray-500 text-sm mb-1">
                  Patients
                </span>
                <span className="block text-2xl font-bold text-gray-900">
                  1000+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Availability */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Weekly Availability
            </h3>

            <div className="flex flex-wrap gap-2 mb-6">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const isAvailable = doctor.availableDays?.some(
                  (d) => d.includes(day) || d === day,
                ); // Simple matching
                return (
                  <div
                    key={day}
                    className={`
                           w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                           ${isAvailable ? "bg-primary-600 text-white shadow-md" : "bg-gray-100 text-gray-400"}
                        `}
                  >
                    {day.charAt(0)}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl text-indigo-900">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs font-semibold uppercase text-indigo-500">
                  Visiting Hours
                </p>
                <p className="font-bold">
                  {doctor.availableTimeStart} - {doctor.availableTimeEnd}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Contact Info</h3>
                <p className="text-green-100 text-sm mb-3">
                  Reach out directly for emergencies.
                </p>
                <p className="font-mono bg-black/20 px-3 py-1.5 rounded-lg inline-block">
                  {doctor.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsPage;
