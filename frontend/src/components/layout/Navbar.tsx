import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';
import { HeartPulse, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'DOCTOR':
        return 'info';
      case 'PHARMACIST':
        return 'warning';
      case 'STUDENT':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <nav className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
            BIT HEALTH CENTER
          </span>
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Bannari Amman Institute of Technology
          </span>
        </div>
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-200 leading-none">{user.name}</p>
              <p className="text-[11px] text-slate-400 mt-1">{user.email}</p>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
              {user.role}
            </Badge>
          </div>

          <Link
            to="/profile"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="My Profile"
          >
            <UserIcon className="w-5 h-5" />
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};
