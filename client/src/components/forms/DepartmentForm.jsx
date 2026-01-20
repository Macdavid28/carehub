import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Loader2 } from "lucide-react";

const schema = yup
  .object({
    name: yup.string().required("Department name is required"),
    description: yup.string().required("Description is required"),
    image: yup.string().url("Must be a valid URL"), // Optional
  })
  .required();

const DepartmentForm = ({ onSuccess, initialData }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {},
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (initialData?._id) {
        return axios.put(`/departments/${initialData._id}`, data);
      }
      return axios.post("/departments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Department Name"
        placeholder="Cardiology"
        {...register("name")}
        error={errors.name?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="Department description..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <Input
        label="Image URL (Optional)"
        placeholder="https://..."
        {...register("image")}
        error={errors.image?.message}
      />

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          {initialData ? "Update Department" : "Create Department"}
        </Button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500 text-center">
          {mutation.error?.response?.data?.message || "Something went wrong"}
        </p>
      )}
    </form>
  );
};

export default DepartmentForm;
