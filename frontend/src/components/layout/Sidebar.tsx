import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  Users,
  BarChart3,
  Bell,
  UserCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const roleNavItems = {
    STUDENT: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Book Appointment', path: '/appointments/book', icon: Calendar },
      { label: 'My Appointments', path: '/appointments', icon: Calendar },
      { label: 'Medical History', path: '/history', icon: FileText },
      { label: 'Prescriptions', path: '/prescriptions', icon: Pill },
    ],
    DOCTOR: [
      { label: 'Doctor Console', path: '/dashboard', icon: LayoutDashboard },
      { label: "Today's Queue", path: '/doctor/queue', icon: UserCheck },
      { label: 'My Schedule', path: '/doctor/schedule', icon: Calendar },
      { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    ],
    PHARMACIST: [
      { label: 'Pharmacy Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Pending Prescriptions', path: '/pharmacy/prescriptions', icon: Pill },
      { label: 'Inventory Stock', path: '/pharmacy/inventory', icon: Pill },
      { label: 'Stock Alerts', path: '/pharmacy/alerts', icon: Bell },
      { label: 'Stock Audit', path: '/pharmacy/transactions', icon: BarChart3 },
      { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    ],
    ADMIN: [
      { label: 'Admin Overview', path: '/dashboard', icon: LayoutDashboard },
      { label: 'User Management', path: '/admin/users', icon: Users },
      { label: 'Doctor Roster', path: '/admin/doctors', icon: Calendar },
      { label: 'Master Inventory', path: '/admin/medicines', icon: Pill },
      { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    ],
  };

  const items = roleNavItems[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-indigo-100 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex shadow-sm">
      <div className="space-y-1.5">
        <p className="px-3 text-[11px] font-black uppercase tracking-wider text-indigo-500 mb-3">
          {user.role} NAVIGATION
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-indigo-900/80 hover:text-purple-600 hover:bg-indigo-50/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900">
        <p className="font-extrabold text-indigo-950">BIT Health Center</p>
        <p className="mt-0.5 text-[11px] text-indigo-700 font-medium">Campus Academic Lifecycle Portal</p>
      </div>
    </aside>
  );
};
