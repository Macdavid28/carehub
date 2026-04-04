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
  gender: yup.string().oneOf(["Male", "Female"]).required("Gender is required"),
  contact: yup.string().nullable(),
  address: yup.string().nullable(),
  bloodGroup: yup.string().nullable(),
  // Emergency Contact
  emergencyContact: yup.object({
    name: yup.string().nullable(),
    phone: yup.string().nullable(),
    relation: yup.string().nullable(),
  }),
  // Insurance
  insurance: yup.object({
    provider: yup.string().nullable(),
    policyNumber: yup.string().nullable(),
    expiryDate: yup.string().nullable(),
  }),
});

const EditPatientProfileForm = ({ onSuccess }) => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch latest data
  const { data: patientData, isLoading } = useQuery({
    queryKey: ["patientProfile", user?._id],
    queryFn: async () => {
      const { data } = await axios.get(`/patients/${user._id}`);
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
      contact: "",
      address: "",
      bloodGroup: "",
      emergencyContact: {
        name: "",
        phone: "",
        relation: "",
      },
      insurance: {
        provider: "",
        policyNumber: "",
        expiryDate: "",
      },
    },
  });

  // Update form values when data is fetched
  useEffect(() => {
    if (patientData) {
      reset({
        name: patientData.name || "",
        contact: patientData.contact || "",
        address: patientData.address || "",
        bloodGroup: patientData.bloodGroup || "",
        emergencyContact: {
          name: patientData.emergencyContact?.name || "",
          phone: patientData.emergencyContact?.phone || "",
          relation: patientData.emergencyContact?.relation || "",
        },
        insurance: {
          provider: patientData.insurance?.provider || "",
          policyNumber: patientData.insurance?.policyNumber || "",
          expiryDate: patientData.insurance?.expiryDate
            ? patientData.insurance.expiryDate.split("T")[0]
            : "",
        },
      });
    }
  }, [patientData, reset]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: updatedProfile } = await axios.put(
        `/patients/${user._id}`,
        data,
      );
      return updatedProfile;
    },
    onSuccess: (data) => {
      setUser({ ...user, ...data }); // Update auth store as well for header name etc
      queryClient.invalidateQueries(["patientProfile"]);
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
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">
          Basic Information
        </h4>
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
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact Number"
            {...register("contact")}
            error={errors.contact?.message}
          />
          <Input
            label="Blood Group"
            {...register("bloodGroup")}
            placeholder="e.g. O+"
            error={errors.bloodGroup?.message}
          />
        </div>
        <Input
          label="Address"
          {...register("address")}
          error={errors.address?.message}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">
          Emergency Contact
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contact Name" {...register("emergencyContact.name")} />
          <Input label="Relation" {...register("emergencyContact.relation")} />
        </div>
        <Input label="Phone Number" {...register("emergencyContact.phone")} />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">
          Insurance Details
        </h4>
        <Input label="Provider Name" {...register("insurance.provider")} />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Policy Number"
            {...register("insurance.policyNumber")}
          />
          <Input
            label="Expiry Date"
            type="date"
            {...register("insurance.expiryDate")}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditPatientProfileForm;
