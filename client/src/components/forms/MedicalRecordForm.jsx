import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Plus, Trash } from "lucide-react";

const schema = yup.object({
  diagnosis: yup.string().required("Diagnosis is required"),
  notes: yup.string(),
  vitals: yup.object({
    bloodPressure: yup.string(),
    heartRate: yup.string(),
    temperature: yup.string(),
    weight: yup.string(),
  }),
  labResults: yup.array().of(
    yup.object({
      testName: yup.string().required("Test Name required"),
      result: yup.string().required("Result required"),
      date: yup.date().default(() => new Date()),
    }),
  ),
});

const MedicalRecordForm = ({ patientId, initialData, onSuccess }) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      diagnosis: initialData?.diagnosis || "",
      notes: initialData?.notes || "",
      vitals: {
        bloodPressure: initialData?.vitals?.bloodPressure || "",
        heartRate: initialData?.vitals?.heartRate || "",
        temperature: initialData?.vitals?.temperature || "",
        weight: initialData?.vitals?.weight || "",
      },
      labResults: initialData?.labResults || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "labResults",
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Backend expects: patient, doctor (from token), diagnosis, ...
      if (isEditing) {
        return axios.patch(`/medical-records/${initialData._id}`, data);
      }
      return axios.post("/medical-records", { ...data, patient: patientId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patientRecords", patientId]);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[70vh] overflow-y-auto p-1"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diagnosis
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={2}
          {...register("diagnosis")}
        />
        {errors.diagnosis && (
          <p className="text-red-500 text-xs mt-1">
            {errors.diagnosis.message}
          </p>
        )}
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Vitals</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Blood Pressure"
            placeholder="120/80"
            {...register("vitals.bloodPressure")}
          />
          <Input
            label="Heart Rate (bpm)"
            placeholder="72"
            {...register("vitals.heartRate")}
          />
          <Input
            label="Temperature (°C)"
            placeholder="36.6"
            {...register("vitals.temperature")}
          />
          <Input
            label="Weight (kg)"
            placeholder="70"
            {...register("vitals.weight")}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-900">Lab Results</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ testName: "", result: "" })}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Test
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <Input
                placeholder="Test Name"
                {...register(`labResults.${index}.testName`)}
              />
              <Input
                placeholder="Result"
                {...register(`labResults.${index}.result`)}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Clinical Notes
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" isLoading={mutation.isPending}>
          {isEditing ? "Update Record" : "Save Record"}
        </Button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;
