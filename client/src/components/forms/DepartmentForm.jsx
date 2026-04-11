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
    image: yup.mixed().nullable(), // For file upload
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
    mutationFn: async (formData) => {
      if (initialData?._id) {
        return axios.put(`/departments/${initialData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return axios.post("/departments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    
    // If a new file is selected, append it
    if (data.image && data.image.length > 0) {
      formData.append("image", data.image[0]);
    }
    
    mutation.mutate(formData);
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department Image
        </label>
        <input
          type="file"
          accept="image/*"
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
          {...register("image")}
        />
        {initialData?.image && !errors.image && (
          <p className="text-xs text-gray-500 mt-1">
            Current image: {initialData.image.split('/').pop()}
          </p>
        )}
        {errors.image && (
          <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>
        )}
      </div>

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
