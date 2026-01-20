import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";

const schema = yup
  .object({
    doctor: yup.string().required("Please select a doctor"),
    date: yup.string().required("Date is required"),
    time: yup.string().required("Time is required"),
    reason: yup.string().required("Reason is required"),
  })
  .required();

const AppointmentForm = ({ onSuccess, preselectedDoctorId }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      doctor: preselectedDoctorId || "",
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await axios.get("/doctors");
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      return axios.post("/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Doctor
        </label>
        <select
          {...register("doctor")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select a Doctor</option>
          {doctors?.map((doc) => (
            <option key={doc._id} value={doc._id}>
              Dr. {doc?.name} ({doc.specialization})
            </option>
          ))}
        </select>
        {errors.doctor && (
          <p className="text-sm text-red-500 mt-1">{errors.doctor.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          {...register("date")}
          error={errors.date?.message}
        />
        <Input
          label="Time"
          type="time"
          {...register("time")}
          error={errors.time?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Visit
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={2}
          placeholder="Describe your symptoms..."
          {...register("reason")}
        />
        {errors.reason && (
          <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          Book Appointment
        </Button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500 text-center">
          {mutation.error?.response?.data?.message || "Booking failed"}
        </p>
      )}
    </form>
  );
};

export default AppointmentForm;
