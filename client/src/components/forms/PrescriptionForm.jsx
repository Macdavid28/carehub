import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";

const schema = yup.object({
  medication: yup.string().required("Medication name is required"),
  dosage: yup.string().required("Dosage is required"),
  frequency: yup.string().required("Frequency is required"),
  duration: yup.string().required("Duration is required"),
  refillsRemaining: yup
    .number()
    .typeError("Refills must be a number")
    .default(0),
  instructions: yup.string(),
  startDate: yup.date().default(() => new Date()),
});

const PrescriptionForm = ({ patientId, initialData, onSuccess }) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      medication: initialData?.medication || "",
      dosage: initialData?.dosage || "",
      frequency: initialData?.frequency || "",
      duration: initialData?.duration || "",
      refillsRemaining: initialData?.refillsRemaining || 0,
      instructions: initialData?.instructions || "",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate)
        : new Date(),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return axios.patch(`/prescriptions/${initialData._id}`, data);
      }
      return axios.post("/prescriptions", { ...data, patient: patientId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patientPrescriptions", patientId]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Medication Name"
        {...register("medication")}
        error={errors.medication?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Dosage"
          placeholder="e.g. 500mg"
          {...register("dosage")}
          error={errors.dosage?.message}
        />
        <Input
          label="Frequency"
          placeholder="e.g. Twice daily"
          {...register("frequency")}
          error={errors.frequency?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration"
          placeholder="e.g. 7 days"
          {...register("duration")}
          error={errors.duration?.message}
        />
        <Input
          label="Refills"
          type="number"
          {...register("refillsRemaining")}
          error={errors.refillsRemaining?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instructions
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={2}
          placeholder="Take with food..."
          {...register("instructions")}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          {isEditing ? "Update Prescription" : "Create Prescription"}
        </Button>
      </div>
    </form>
  );
};

export default PrescriptionForm;
