import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import { FileText, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";

const MedicalRecords = () => {
  const { data: records, isLoading } = useQuery({
    queryKey: ["myRecords"],
    queryFn: async () => {
      const { data } = await axios.get("/medical-records/my-records");
      return data;
    },
  });

  if (isLoading)
    return <div className="p-8 text-center">Loading medical records...</div>;

  return (
    <div className="space-y-6">
      {records?.map((record) => (
        <div
          key={record._id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-4 bg-primary-50 border-b border-primary-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-primary-900">
                {format(new Date(record.visitDate), "MMMM dd, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-700">
                Dr. {record.doctor?.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  record.status === "Voided"
                    ? "bg-red-50 text-red-700 border-red-100"
                    : record.status === "Amended"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-green-50 text-green-700 border-green-100"
                }`}
              >
                {record.status || "Active"}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Diagnosis & Notes
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Diagnosis
                  </span>
                  <p className="font-medium">{record.diagnosis}</p>
                </div>
                {record.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Clinical Notes
                    </span>
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Vitals & Labs
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 border rounded-lg text-center">
                  <span className="block text-xs text-gray-500">
                    Blood Pressure
                  </span>
                  <span className="font-bold text-gray-900">
                    {record.vitals?.bloodPressure || "--"}
                  </span>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <span className="block text-xs text-gray-500">
                    Heart Rate
                  </span>
                  <span className="font-bold text-gray-900">
                    {record.vitals?.heartRate || "--"} bpm
                  </span>
                </div>
              </div>

              {record.labResults?.length > 0 && (
                <div className="mt-4">
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Lab Results
                  </span>
                  <ul className="space-y-2">
                    {record.labResults.map((lab, i) => (
                      <li
                        key={i}
                        className="text-sm flex justify-between border-b pb-1 last:border-0 border-gray-100"
                      >
                        <span>{lab.testName}</span>
                        <span className="font-medium">{lab.result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {records?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No medical records found.</p>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
