import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import useAuthStore from "../../store/useAuthStore";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  gender: yup
    .string()
    .oneOf(["Male", "Female", "Other"])
    .required("Gender is required"),
  specialization: yup.string().required("Specialization is required"),
  qualification: yup.string().required("Qualification is required"),
  fees: yup
    .number()
    .typeError("Fees must be a number")
    .required("Fees is required"),
  experience: yup.string().required("Experience is required"),
  about: yup.string().nullable(),
});

const EditDoctorProfileForm = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch latest data to ensure admin updates are seen by doctor
  const { data: doctorData, isLoading } = useQuery({
    queryKey: ["doctorProfile", user?._id],
    queryFn: async () => {
      const { data } = await axios.get(`/doctors/${user._id}`);
      return data;
    },
    enabled: !!user?._id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      specialization: "",
      qualification: "",
      fees: "",
      experience: "",
      about: "",
    },
  });

  // Update form values when data is fetched
  useEffect(() => {
    if (doctorData) {
      reset({
        name: doctorData.name || "",
        specialization: doctorData.specialization || "",
        qualification: doctorData.qualification || "",
        fees: doctorData.fees || "",
        experience: doctorData.experience || "",
        about: doctorData.about || "",
      });
    }
  }, [doctorData, reset]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: updatedDoctor } = await axios.put(
        `/doctors/${user._id}`,
        data,
      );
      return updatedDoctor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["doctorProfile"]);
      queryClient.invalidateQueries(["doctors"]); // Update public list
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading)
    return <div className="p-4 text-center">Loading profile data...</div>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[70vh] overflow-y-auto p-1"
    >
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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Specialization"
          {...register("specialization")}
          error={errors.specialization?.message}
        />
        <Input
          label="Qualification"
          {...register("qualification")}
          error={errors.qualification?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Consultation Fees ($)"
          type="number"
          {...register("fees")}
          error={errors.fees?.message}
        />
        <Input
          label="Experience (Years)"
          {...register("experience")}
          error={errors.experience?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          About
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
          {...register("about")}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditDoctorProfileForm;
