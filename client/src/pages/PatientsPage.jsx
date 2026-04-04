import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../services/api";
import { Plus, Search, MoreVertical, Eye, Trash2, Edit } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const PatientsPage = ({ scope = "all" }) => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients", scope],
    queryFn: async () => {
      const url = scope === "mine" ? "/patients?myPatients=true" : "/patients";
      const { data } = await axios.get(url);
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
    },
    onError: () => {
      alert("Failed to delete patient");
    },
  });

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) return <div className="p-8">Loading patients...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        {user?.role === "admin" && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients?.map((patient) => (
                <tr
                  key={patient._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.name}
                        </p>
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {patient.contact || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium border border-red-100">
                      {patient.bloodGroup || "?"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">
                    {patient.gender || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/${user?.role}/patients/${patient._id}`}>
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to remove this patient?",
                              )
                            ) {
                              deleteMutation.mutate(patient._id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients?.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
