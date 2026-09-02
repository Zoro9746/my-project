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
      { label: 'Consultations', path: '/doctor/consult', icon: FileText },
      { label: 'My Schedule', path: '/doctor/schedule', icon: Calendar },
    ],
    PHARMACIST: [
      { label: 'Pharmacy Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Pending Prescriptions', path: '/pharmacy/prescriptions', icon: Pill },
      { label: 'Inventory Stock', path: '/pharmacy/inventory', icon: Pill },
      { label: 'Stock Alerts', path: '/pharmacy/alerts', icon: Bell },
    ],
    ADMIN: [
      { label: 'Admin Overview', path: '/dashboard', icon: LayoutDashboard },
      { label: 'User Management', path: '/admin/users', icon: Users },
      { label: 'Doctor Schedules', path: '/admin/schedules', icon: Calendar },
      { label: 'Inventory Control', path: '/admin/medicines', icon: Pill },
      { label: 'System Reports', path: '/admin/reports', icon: BarChart3 },
    ],
  };

  const items = roleNavItems[user.role] || [];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 glass-panel min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          {user.role} Navigation
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">BIT Health Center v1.0</p>
        <p className="mt-1 text-[11px]">Academic Mini Project — Phase 1 Active</p>
      </div>
    </aside>
  );
};
