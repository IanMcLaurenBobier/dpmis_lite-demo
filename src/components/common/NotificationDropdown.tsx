import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppNotification } from '../../types';
import { getNotifications, markNotificationAsRead } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';

export const NotificationDropdown: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    const items = await getNotifications(currentUser.id);
    setNotifications(items);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    for (const notif of notifications) {
      if (!notif.is_read) {
        await markNotificationAsRead(notif.id);
      }
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border border-[#153B65]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-4 py-3 bg-[#153B65] text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-300" />
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-sky-500/30 text-sky-200 rounded-full border border-sky-400/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-sky-200 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkRead(item.id)}
                    className={`p-3.5 transition-colors cursor-pointer hover:bg-gray-50 flex items-start gap-3 ${
                      !item.is_read ? 'bg-sky-50/40' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.title.toLowerCase().includes('approved') ? (
                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : item.title.toLowerCase().includes('correction') ? (
                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-blue-100 text-[#153B65] rounded-lg">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-semibold ${!item.is_read ? 'text-[#153B65]' : 'text-gray-700'}`}>
                          {item.title}
                        </p>
                        {!item.is_read && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {item.message}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
              <span className="text-[11px] text-gray-500">
                Connected to Cloud Firestore realtime updates
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
