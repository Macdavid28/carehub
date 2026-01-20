import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../services/api";
import { Check, X, Ban, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Button from "./ui/Button";

const AppointmentActions = ({ appointment, userRole }) => {
  const queryClient = useQueryClient();
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: appointment.date?.split("T")[0] || "",
    time: appointment.time || "",
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
      queryClient.invalidateQueries(["doctorAppointments"]);
      queryClient.invalidateQueries(["patientAppointments"]);
      setIsRescheduleOpen(false);
      toast.success("Action completed successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Action failed");
    },
  });

  const handleStatusUpdate = (status) => {
    if (
      window.confirm(
        `Are you sure you want to ${status.toLowerCase()} this appointment?`,
      )
    ) {
      updateStatusMutation.mutate({ id: appointment._id, status });
    }
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    updateStatusMutation.mutate({
      id: appointment._id,
      status: "Pending",
      date: rescheduleData.date,
      time: rescheduleData.time,
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Admin/Doctor Actions */}
        {["admin", "doctor"].includes(userRole) &&
          appointment.status === "Pending" && (
            <>
              <button
                onClick={() => handleStatusUpdate("Confirmed")}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusUpdate("Cancelled")}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

        {/* Patient Actions */}
        {userRole === "patient" &&
          ["Pending", "Confirmed"].includes(appointment.status) && (
            <>
              <button
                onClick={() => setIsRescheduleOpen(true)}
                className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                title="Reschedule"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusUpdate("Cancelled")}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Cancel"
              >
                <Ban className="w-4 h-4" />
              </button>
            </>
          )}
      </div>

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
            value={rescheduleData.date}
            onChange={(e) =>
              setRescheduleData({ ...rescheduleData, date: e.target.value })
            }
          />
          <Input
            label="New Time"
            type="time"
            required
            value={rescheduleData.time}
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
              Confirm
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AppointmentActions;
