import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../services/api";
import { Plus, Search, Building, Trash2, Edit } from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import DepartmentForm from "../components/forms/DepartmentForm";
import useAuthStore from "../store/useAuthStore";

const DepartmentsPage = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const queryClient = useQueryClient();

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedDept(null);
  };

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await axios.get("/departments");
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
    },
    onError: () => {
      alert("Failed to delete department");
    },
  });

  const filteredDepartments = departments?.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) return <div className="p-8">Loading departments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        {user?.role === "admin" && (
          <Button
            onClick={() => {
              setSelectedDept(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredDepartments?.map((dept) => (
            <div
              key={dept._id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {dept.image ? (
                  <img
                    src={dept.image}
                    alt={dept.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {dept.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {dept.description}
                </p>

                <div className="flex items-center justify-between mt-4 border-t pt-4">
                  <span className="text-xs text-gray-500">
                    Head: {dept.head?.user?.name || "Not Assigned"}
                  </span>
                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to remove this department?",
                            )
                          ) {
                            deleteMutation.mutate(dept._id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredDepartments?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No departments found.
            </div>
          )}
        </div>
      </div>

      <Modal
        title={selectedDept ? "Edit Department" : "Add Department"}
        isOpen={isModalOpen}
        onClose={handleClose}
      >
        <DepartmentForm onSuccess={handleClose} initialData={selectedDept} />
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
