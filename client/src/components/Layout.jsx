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
  Bell,
  ChevronRight,
  Stethoscope,
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
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 glass-sidebar">
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
          <aside className="absolute left-4 top-4 bottom-4 w-72 glass-card flex flex-col shadow-2xl p-0 overflow-hidden">
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
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="glass-navbar h-20 flex items-center px-6 md:px-10 justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 -ml-2 text-slate-600 hover:bg-white rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">C</div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">CareHub</h1>
            </div>
            
            <div className="hidden md:block">
               <h2 className="text-lg font-bold text-slate-800">
                 {navItems.find(item => location.pathname.startsWith(item.path))?.label || "General"}
               </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all relative group">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
            
            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
               <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 capitalize">{user?.role}</p>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-200 ring-2 ring-white overflow-hidden group-hover:ring-primary-100 transition-all">
                   {user?.name?.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in">
            <Outlet />
          </div>
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
  <div className="flex flex-col h-full">
    <div className="p-8 pb-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary-100 ring-4 ring-primary-50">C</div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          CareHub
        </h1>
      </div>
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>

    <div className="px-6 py-4">
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
       <nav className="space-y-1.5">
        {filteredNav.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300",
                isActive
                  ? "nav-item-active"
                  : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary-600" : "text-slate-400 group-hover:text-primary-500")} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>
    </div>

    <div className="mt-auto px-6 py-8">
      <div className="glass-card p-4 !rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/30 transition-all duration-500"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-3 ring-1 ring-white/20 shadow-inner">
                <Stethoscope className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-xs font-bold text-white mb-4">Need medical help?</p>
            <button className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-400 text-white text-[11px] font-black rounded-xl transition-all shadow-lg shadow-primary-900/50 active:scale-95">
                Contact Support
            </button>
        </div>
      </div>

      <div className="mt-8 px-4 flex items-center justify-between">
         <button 
           onClick={handleLogout}
           className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors group"
         >
            <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                <LogOut className="w-4 h-4" />
            </div>
            Sign Out
         </button>
      </div>
    </div>
  </div>
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
