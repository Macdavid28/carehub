import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import EditPatientProfileForm from "../components/forms/EditPatientProfileForm";
import EditDoctorProfileForm from "../components/forms/EditDoctorProfileForm";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fallback for unexpected roles not handling profile
  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        {user.role === "patient" && (
          <EditPatientProfileForm
            onSuccess={() => {
              // Optional: Show toast or just refresh data
              // The form itself invalidates queries
            }}
          />
        )}

        {user.role === "doctor" && (
          <EditDoctorProfileForm
            onSuccess={() => {
              // Success handling
            }}
          />
        )}

        {user.role === "admin" && (
          <div className="text-gray-500">
            Admin profiles are currently managed by system configuration.
            <br />
            Name: {user.name} <br />
            Email: {user.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
