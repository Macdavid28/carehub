import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../services/api";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Check,
  X,
  Ban,
  CalendarDays,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import Modal from "../components/ui/Modal";
import AppointmentForm from "../components/forms/AppointmentForm";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import Pagination from "../components/ui/Pagination";

const AppointmentsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reschedule State
  const [rescheduleData, setRescheduleData] = useState(null); // { id, date, time }
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const { data } = await axios.get("/appointments");
      return data;
    },
    enabled: !!user?._id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, date, time }) => {
      const payload = { status };
      if (date) payload.date = date;
      if (time) payload.time = time;
      return axios.put(`/appointments/${id}/status`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      setIsRescheduleOpen(false);
      setRescheduleData(null);
      toast.success("Action completed successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Action failed");
    },
  });

  const handleStatusUpdate = (id, status) => {
    if (
      window.confirm(
        `Are you sure you want to ${status.toLowerCase()} this appointment?`,
      )
    ) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const openReschedule = (apt) => {
    // Initialize with current values
    setRescheduleData({
      id: apt._id,
      date: apt.date.split("T")[0],
      time: apt.time,
    });
    setIsRescheduleOpen(true);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    updateStatusMutation.mutate({
      id: rescheduleData.id,
      status: "Pending", // Reset to pending on reschedule usually
      date: rescheduleData.date,
      time: rescheduleData.time,
    });
  };

  const tabs = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const filteredAppointments =
    appointments?.filter((apt) => {
      const matchesTab = activeTab === "All" || apt.status === activeTab;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (apt.patient?.name?.toLowerCase() || "").includes(searchLower) ||
        (apt.doctor?.name?.toLowerCase() || "").includes(searchLower);
      return matchesTab && matchesSearch;
    }) || [];

  const totalPages = Math.ceil(filteredAppointments.length / pageSize);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <div className="p-8">Loading appointments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        {user?.role === "patient" && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  activeTab === tab
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Patient</th>
                {user?.role !== "doctor" && (
                  <th className="px-6 py-4">Doctor</th>
                )}
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedAppointments.map((apt) => (
                <tr
                  key={apt._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {apt.patient?.name || "Unknown"}
                  </td>
                  {user?.role !== "doctor" && (
                    <td className="px-6 py-4 text-gray-600">
                      Dr. {apt.doctor?.name || "Unknown"}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5 text-gray-900">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {format(new Date(apt.date), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                    {apt.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium border",
                        apt.status === "Confirmed"
                          ? "bg-primary-50 text-primary-700 border-primary-100"
                          : apt.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : apt.status === "Cancelled"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-orange-50 text-orange-700 border-orange-100",
                      )}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Admin/Doctor Actions */}
                      {["admin", "doctor"].includes(user?.role) &&
                        apt.status === "Pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(apt._id, "Confirmed")
                              }
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(apt._id, "Cancelled")
                              }
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                      {/* Patient Actions */}
                      {user?.role === "patient" &&
                        ["Pending", "Confirmed"].includes(apt.status) && (
                          <>
                            <button
                              onClick={() => openReschedule(apt)}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                              title="Reschedule"
                            >
                              <CalendarDays className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(apt._id, "Cancelled")
                              }
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )}

                      <button className="text-gray-400 hover:text-gray-600 text-sm">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <Modal
        title="Book Appointment"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <AppointmentForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        title="Reschedule Appointment"
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <Input
            label="New Date"
            type="date"
            required
            value={rescheduleData?.date || ""}
            onChange={(e) =>
              setRescheduleData({ ...rescheduleData, date: e.target.value })
            }
          />
          <Input
            label="New Time"
            type="time"
            required
            value={rescheduleData?.time || ""}
            onChange={(e) =>
              setRescheduleData({ ...rescheduleData, time: e.target.value })
            }
          />
          <div className="flex justify-end pt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRescheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={updateStatusMutation.isPending}>
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
