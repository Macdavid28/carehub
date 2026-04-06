import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../services/api";
import { Plus, Search, Eye, Trash2, Edit, Filter } from "lucide-react";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import Modal from "../components/ui/Modal";
import DoctorForm from "../components/forms/DoctorForm";
import AppointmentForm from "../components/forms/AppointmentForm";
import useAuthStore from "../store/useAuthStore";
import Pagination from "../components/ui/Pagination";

const DoctorsPage = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const queryClient = useQueryClient();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await axios.get("/doctors");
      return data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await axios.get("/departments");
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
    onError: () => {
      alert("Failed to delete doctor");
    },
  });

  const filteredDoctors =
    doctors?.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = selectedDepartment 
        ? (doc.department?._id === selectedDepartment || doc.department === selectedDepartment)
        : true;
        
      return matchesSearch && matchesDept;
    }) || [];

  const totalPages = Math.ceil(filteredDoctors.length / pageSize);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <div className="p-8">Loading doctors...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        {user?.role === "admin" && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              {departments?.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {paginatedDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl mb-4">
                {doc.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{doc.name}</h3>
              <p className="text-sm text-primary-600 font-medium mb-1">
                {doc.department?.name || doc.specialization}
              </p>
              <p className="text-xs text-gray-500 mb-4">{doc.qualification}</p>

              <div className="w-full flex items-center justify-center gap-2 mt-auto">
                <Link to={`/admin/doctors/${doc._id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
                {user?.role === "patient" && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setIsAppointmentModalOpen(true);
                    }}
                  >
                    Book
                  </Button>
                )}
                {user?.role === "admin" && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to remove this doctor?",
                        )
                      ) {
                        deleteMutation.mutate(doc._id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No doctors found matching your criteria.
            </div>
          )}
        </div>

        {filteredDoctors.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <Modal
        title="Add New Doctor"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <DoctorForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        title={`Book Appointment with Dr. ${selectedDoctor?.name}`}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      >
        <AppointmentForm
          preselectedDoctorId={selectedDoctor?._id}
          onSuccess={() => setIsAppointmentModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default DoctorsPage;
