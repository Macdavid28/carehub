import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Min 6 chars")
      .required("Password is required"), // Only for create
    specialization: yup.string().required("Specialization is required"),
    department: yup.string().required("Department is required"),
    qualification: yup.string().required("Qualification is required"),
    experience: yup
      .number()
      .positive()
      .integer()
      .required("Experience is required"),
  })
  .required();

const DoctorForm = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await axios.get("/departments");
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // API expects user details and doctor details merged or separate?
      // createDoctor controller destructures all from req.body
      return axios.post("/doctors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="Dr. Smith"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          {...register("email")}
          error={errors.email?.message}
        />
      </div>

      <Input
        label="Password"
        type="password"
        placeholder="******"
        {...register("password")}
        error={errors.password?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Specialization"
          placeholder="Cardiologist"
          {...register("specialization")}
          error={errors.specialization?.message}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            {...register("department")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Department</option>
            {departments?.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-sm text-red-500 mt-1">
              {errors.department.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Qualification"
          placeholder="MBBS, MD"
          {...register("qualification")}
          error={errors.qualification?.message}
        />
        <Input
          label="Experience (Years)"
          type="number"
          {...register("experience")}
          error={errors.experience?.message}
        />
      </div>

      {/* <Input
        label="Consultation Fees ($)"
        type="number"
        {...register("fees")}
        error={errors.fees?.message}
      /> */}

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          Add Doctor
        </Button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500 text-center">
          {mutation.error?.response?.data?.message || "Error creating doctor"}
        </p>
      )}
    </form>
  );
};

export default DoctorForm;
