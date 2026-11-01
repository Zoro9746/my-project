import React, { useState, useEffect } from 'react';
import { notificationService, NotificationItem } from '../../services/notificationService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Bell, CheckCheck, Calendar, Pill, ShieldAlert, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      if (onUnreadCountChange) onUnreadCountChange(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-indigo-100 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
      <div className="p-3.5 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600" />
          <h4 className="font-bold text-indigo-950">Notifications ({unreadCount} unread)</h4>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] text-purple-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-purple-100/60 text-indigo-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <p className="text-center py-6 text-indigo-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-indigo-400">
            <Bell className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
            <p className="font-medium">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-xl border transition-all ${
                n.isRead
                  ? 'bg-indigo-50/30 border-indigo-100/60 opacity-80'
                  : 'bg-purple-50/60 border-purple-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {n.type === 'APPOINTMENT' && <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    {n.type === 'STOCK' && <Pill className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    {n.type === 'SYSTEM' && <ShieldAlert className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                    <h5 className="font-bold text-indigo-950">{n.title}</h5>
                  </div>
                  <p className="text-indigo-800 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-indigo-500 font-mono mt-1">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 text-[10px] shrink-0 font-semibold"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
