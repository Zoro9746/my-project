import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';
import { HeartPulse, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationDrawer } from './NotificationDrawer';
import { notificationService } from '../../services/notificationService';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const data = await notificationService.getNotifications();
          setUnreadCount(data.unreadCount);
        } catch (e) {
          // Silent catch
        }
      };
      fetchUnread();
    }
  }, [user]);

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
    <nav className="h-16 bg-white border-b border-indigo-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-indigo-950">
            BIT HEALTH CENTER
          </span>
          <span className="block text-[10px] uppercase tracking-wider font-extrabold text-purple-600">
            Bannari Amman Institute of Technology
          </span>
        </div>
      </Link>

      {user && (
        <div className="flex items-center gap-4 relative">
          {/* Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-indigo-700 hover:text-purple-600 hover:bg-indigo-50 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDrawer
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={(count) => setUnreadCount(count)}
            />
          </div>

          {/* User Profile Chip (PCDP Portal Style) */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-[11px] font-extrabold text-indigo-600 font-mono leading-tight">
                {user.student?.rollNo || user.email.split('@')[0].toUpperCase()}
              </p>
              <p className="text-xs font-black text-indigo-950 leading-tight uppercase mt-0.5">
                {user.name}
              </p>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
              {user.role}
            </Badge>
          </div>

          <Link
            to="/profile"
            className="p-2 rounded-xl text-indigo-700 hover:text-purple-600 hover:bg-indigo-50 transition-colors"
            title="My Profile"
          >
            <UserIcon className="w-5 h-5" />
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-indigo-50 hover:bg-rose-50 text-indigo-700 hover:text-rose-600 border border-indigo-100 hover:border-rose-200 transition-all"
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
