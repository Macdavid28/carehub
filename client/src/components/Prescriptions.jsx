import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import { Pill, RotateCcw, Clock, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import Button from "./ui/Button";

const Prescriptions = () => {
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["myPrescriptions"],
    queryFn: async () => {
      const { data } = await axios.get("/prescriptions/my-prescriptions");
      return data;
    },
  });

  if (isLoading)
    return <div className="p-8 text-center">Loading prescriptions...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions?.map((script) => (
          <div
            key={script._id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Pill className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      script.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {script.status}
                  </span>
                  {script.image && (
                    <a
                      href={`http://localhost:8000${script.image}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 font-bold uppercase tracking-wider"
                    >
                      <ImageIcon className="w-3 h-3" />
                      View Image
                    </a>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {script.medication}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{script.dosage}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {script.frequency}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {script.refillsRemaining} refills remaining
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-3">
                Prescribed by Dr. {script.doctor?.name} on{" "}
                {format(new Date(script.startDate), "MMM dd, yyyy")}
              </p>
              {script.status === "Active" && (
                <Button variant="outline" size="sm" className="w-full">
                  Request Refill
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {prescriptions?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active prescriptions found.</p>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
