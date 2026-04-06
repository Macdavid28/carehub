import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../services/api";
import { Plus, Search, MoreVertical, Eye, Trash2, Edit } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import Pagination from "../components/ui/Pagination";
import { toast } from "react-hot-toast";
import PatientForm from "../components/forms/PatientForm";

const PatientsPage = ({ scope = "all" }) => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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
      toast.success("Patient deleted");
    },
    onError: () => {
      alert("Failed to delete patient");
      toast.error("Failed to delete patient");
    },
  });

  const filteredPatients =
    patients?.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <div className="p-8">Loading patients...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        {user?.role === "admin" && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        )}
      </div>

      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex gap-4 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full py-2 pr-4 text-sm border border-gray-200 rounded-lg pl-9 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="font-medium text-gray-600 bg-gray-50">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPatients.map((patient) => (
                <tr
                  key={patient._id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 font-bold rounded-full bg-primary-100 text-primary-700">
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
                    <span className="px-2 py-1 text-xs font-medium text-red-700 border border-red-100 rounded bg-red-50">
                      {patient.bloodGroup || "?"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">
                    {patient.gender || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/${user?.role}/patients/${patient._id}`}>
                        <button className="p-2 text-gray-400 transition-colors rounded-lg hover:text-primary-600 hover:bg-primary-50">
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
                          className="p-2 text-gray-400 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
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
        {filteredPatients.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
