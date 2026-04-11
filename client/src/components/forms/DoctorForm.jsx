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
    email: yup.string().email("Invalid email").when("$isEdit", {
      is: true,
      then: (s) => s.notRequired(),
      otherwise: (s) => s.required("Email is required"),
    }),
    password: yup.string().when("$isEdit", {
      is: true,
      then: (s) => s.notRequired(),
      otherwise: (s) => s.min(6, "Min 6 chars").required("Password is required"),
    }),
    specialization: yup.string().required("Specialization is required"),
    department: yup.string().required("Department is required"),
    qualification: yup.string().required("Qualification is required"),
    experience: yup
      .number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .positive()
      .integer()
      .required("Experience is required"),
    about: yup.string().nullable(),
  })
  .required();

const DoctorForm = ({ onSuccess, initialData }) => {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit },
    defaultValues: initialData
      ? {
          ...initialData,
          department: initialData.department?._id || initialData.department,
        }
      : {},
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
      if (isEdit) {
        return axios.put(`/doctors/${initialData._id}`, data);
      }
      return axios.post("/doctors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
      queryClient.invalidateQueries(["doctor", initialData?._id]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className={`grid ${isEdit ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
        <Input
          label="Full Name"
          placeholder="Dr. Smith"
          {...register("name")}
          error={errors.name?.message}
        />
        {!isEdit && (
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
        )}
      </div>

      {!isEdit && (
        <Input
          label="Password"
          type="password"
          placeholder="******"
          {...register("password")}
          error={errors.password?.message}
        />
      )}

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          About
        </label>
        <textarea
          {...register("about")}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Tell us about the doctor..."
        />
        {errors.about && (
          <p className="text-sm text-red-500 mt-1">{errors.about.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          {isEdit ? "Update Profile" : "Add Doctor"}
        </Button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500 text-center">
          {mutation.error?.response?.data?.message ||
            `Error ${isEdit ? "updating" : "creating"} doctor`}
        </p>
      )}
    </form>
  );
};

export default DoctorForm;
