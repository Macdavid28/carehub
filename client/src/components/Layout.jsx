import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {
  LogOut,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  User,
  Search,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: `/${user?.role}/dashboard`,
      icon: LayoutDashboard,
      roles: ["admin", "doctor", "patient"],
    },
    {
      label: "Appointments",
      path: `/${user?.role}/appointments`,
      icon: Calendar,
      roles: ["admin", "doctor", "patient"],
    },
    {
      label: "Patients",
      path: `/${user?.role}/patients`,
      icon: Users,
      roles: ["admin", "doctor"],
    },
    { label: "Doctors", path: "/admin/doctors", icon: User, roles: ["admin"] },
    {
      label: "Departments",
      path: "/admin/departments",
      icon: FileText,
      roles: ["admin"],
    },
    {
      label: "Profile",
      path: `/${user?.role}/profile`,
      icon: Settings, // Using Settings icon for Profile/Settings
      roles: ["admin", "doctor", "patient"],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-md border-r border-gray-100">
        <SidebarContent
          user={user}
          handleLogout={handleLogout}
          filteredNav={filteredNav}
          location={location}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar Panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            <SidebarContent
              user={user}
              handleLogout={handleLogout}
              filteredNav={filteredNav}
              location={location}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              isMobile
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-4 md:px-6 justify-between border-b gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-primary-600 md:hidden">
              CareHub
            </h1>
          </div>

          <div className="flex-1 max-w-xl mx-auto hidden md:block">
            {/* <GlobalSearch role={user?.role} /> */}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({
  user,
  handleLogout,
  filteredNav,
  location,
  setIsMobileMenuOpen,
  isMobile,
}) => (
  <>
    <div className="p-6 border-b flex justify-between items-center">
      <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
        CareHub
      </h1>
      {/* Close button for mobile only */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>

    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      {filteredNav.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
            location.pathname.startsWith(item.path)
              ? "bg-primary-50 text-primary-700"
              : "text-gray-600 hover:bg-gray-100",
          )}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Link>
      ))}
    </nav>

    <div className="p-4 border-t">
      <div className="flex items-center gap-3 mb-4 px-4">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  </>
);

const GlobalSearch = ({ role }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Smart Redirect Logic
    if (role === "admin") {
      // Check if query looks like a doctor or department? Default to patients for now.
      // Or iterate? Let's default to Patients as it's the most common search.
      navigate(`/admin/patients?search=${encodeURIComponent(query)}`);
    } else if (role === "patient") {
      // Search Doctors
      navigate(`/patient/doctors?search=${encodeURIComponent(query)}`); // Assuming route exists or will be created
    } else if (role === "doctor") {
      // Search Patients
      navigate(`/doctor/patients?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={role === "patient" ? "Find a doctor..." : "Search..."}
        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};

export default Layout;
