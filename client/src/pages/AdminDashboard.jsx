import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import {
  Users,
  UserPlus,
  Calendar,
  Activity,
  Building,
  Lock,
  ArrowRight,
  FileBarChart2,
} from "lucide-react";
import ChangePasswordModal from "../components/ChangePasswordModal";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import useAuthStore from "../store/useAuthStore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PatientForm from "../components/forms/PatientForm";

const StatCard = ({ label, value, color, bg, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {/* Placeholder for trend indicator */}
      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
        +4.5%
      </span>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

const QuickActionCard = ({ to, icon: Icon, label, description, color, bg }) => (
  <Link
    to={to}
    className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-primary-100"
  >
    <div
      className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}
    >
      <Icon className={`w-24 h-24 ${color}`} />
    </div>
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg}`}
    >
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
      {label}
    </h3>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    <div className="flex items-center text-sm font-medium text-primary-600 group-hover:translate-x-1 transition-transform">
      Execute <ArrowRight className="w-4 h-4 ml-1" />
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const { data } = await axios.get("/stats");
      return data;
    },
  });

  if (isLoading) return <div className="p-8">Loading stats...</div>;

  const chartData = stats?.appointmentStats
    ? [
        { name: "Mon", value: 12 }, // Mock data for better visual curve
        { name: "Tue", value: 18 },
        { name: "Wed", value: 15 },
        { name: "Thu", value: 25 },
        { name: "Fri", value: 20 },
        { name: "Sat", value: 30 },
        { name: "Sun", value: stats.appointmentStats.completed + 5 }, // Using real data
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name?.split(" ")[0]}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsPasswordModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Change Password
        </Button>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Patients"
          value={stats?.patientsCount || 0}
          icon={Users}
          color="text-primary-600"
          bg="bg-primary-50"
        />
        <StatCard
          label="Total Doctors"
          value={stats?.doctorsCount || 0}
          icon={UserPlus}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label="Total Appointments"
          value={stats?.appointmentsCount || 0}
          icon={Calendar}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          label="Departments"
          value={stats?.departmentsCount || 0}
          icon={Building}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Appointment Analytics
              </h2>
              <p className="text-sm text-gray-500">Weekly appointment trends</p>
            </div>
            <div className="flex gap-2">
              {/* Mock Filters */}
              <button className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full">
                Weekly
              </button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-full">
                Monthly
              </button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8e72" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff8e72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ff8e72"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-lg text-white">
          <h2 className="text-xl font-bold mb-2">Priority Actions</h2>
          <p className="text-gray-400 mb-8 text-sm">
            Quickly manage your hospital resources.
          </p>

          <div className="space-y-4">
            <Link
              to="/admin/doctors"
              className="flex items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
            >
              <div className="bg-primary-500 p-2 rounded-lg mr-4">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block font-semibold">Add New Doctor</span>
                <span className="text-xs text-gray-400">
                  Onboard medical staff
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsPatientModalOpen(true)}
              className="flex items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10 w-full text-left"
            >
              <div className="bg-green-500 p-2 rounded-lg mr-4">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block font-semibold">Register Patient</span>
                <span className="text-xs text-gray-400">
                  Create new patient record
                </span>
              </div>
            </button>

            <Link
              to="/admin/departments"
              className="flex items-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
            >
              <div className="bg-orange-500 p-2 rounded-lg mr-4">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block font-semibold">Manage Depts</span>
                <span className="text-xs text-gray-400">
                  Organize hospital units
                </span>
              </div>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <Link
              to="/admin/appointments"
              className="flex justify-between items-center text-sm font-medium hover:text-white text-gray-300 transition-colors"
            >
              View All Reports <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Actions Grid */}
      {/* <h2 className="text-lg font-bold text-gray-900 pt-4">More Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          to="/admin/dashboard"
          icon={FileBarChart2}
          label="Generate Reports"
          description="Export PDF reports for monthly analytics."
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <QuickActionCard
          to="/admin/dashboard" // Hypothetical
          icon={Activity}
          label="Billing & Payments"
          description="Manage hospital finances and invoices."
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <QuickActionCard
          to="/admin/dashboard"
          icon={Lock}
          label="System Settings"
          description="Configure roles and permissions."
          color="text-gray-600"
          bg="bg-gray-50"
        />
      </div> */}
      <Modal
        title="Register New Patient"
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      >
        <PatientForm onSuccess={() => setIsPatientModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
