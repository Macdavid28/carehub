import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Upload, X } from "lucide-react";

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
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.image || null);
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
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "startDate" && data[key]) {
          formData.append(key, new Date(data[key]).toISOString());
        } else {
          formData.append(key, data[key]);
        }
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (!isEditing) {
        formData.append("patient", patientId);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (isEditing) {
        return axios.patch(`/prescriptions/${initialData._id}`, formData, config);
      }
      return axios.post("/prescriptions", formData, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patientPrescriptions", patientId]);
      if (onSuccess) onSuccess();
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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

      {/* Prescription Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prescription Image (Optional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors cursor-pointer relative bg-gray-50">
          {previewUrl ? (
            <div className="relative group">
              <img
                src={
                  previewUrl.startsWith("blob:")
                    ? previewUrl
                    : `http://localhost:8000${previewUrl}`
                }
                alt="Prescription preview"
                className="max-h-48 rounded-lg shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer font-medium text-primary-600 hover:text-primary-500">
                  <span>Upload an image</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>
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
