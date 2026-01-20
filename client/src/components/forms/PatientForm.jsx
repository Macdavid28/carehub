import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    gender: yup
      .string()
      .oneOf(["Male", "Female", "Other"])
      .required("Gender is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters"),
    // Allow password to be optional if editing, but for creation it's usually needed.
    // We'll handle this dynamically or keep it simple for "Add New"
  })
  .required();

const PatientForm = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Admin creating a patient
      return axios.post("/patients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        {...register("name")}
        error={errors.name?.message}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <select
          {...register("gender")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
        )}
      </div>
      <Input
        label="Email Address"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          Create Patient
        </Button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500 text-center">
          {mutation.error?.response?.data?.message ||
            "Failed to create patient"}
        </p>
      )}
    </form>
  );
};

export default PatientForm;
