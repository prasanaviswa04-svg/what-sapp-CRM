import React, { useState, useEffect } from 'react';
import { X, CheckCheck, Bell, MessageSquare, Calendar, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { addToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (data) => {
      setNotifications((prev) => [data, ...prev]);
      addToast(data.title, 'info');
    };

    socket.on('notification', handleNotification);
    socket.on('new_whatsapp_message', (data) => {
      addToast(`New WhatsApp: ${data.customerName}`, 'info');
      fetchNotifications();
    });

    return () => {
      socket.off('notification', handleNotification);
      socket.off('new_whatsapp_message');
    };
  }, [socket, addToast]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-150 border-l border-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-900" />
            <h3 className="font-semibold text-zinc-950 text-xs tracking-tight">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-zinc-600 hover:text-zinc-950 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-900 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3.5 transition hover:bg-zinc-50 flex items-start gap-3 ${
                  !n.isRead ? 'bg-zinc-100/60 font-medium' : ''
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-zinc-950 mt-1.5 flex-shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-zinc-900 tracking-tight">{n.title}</div>
                  <div className="text-zinc-600 mt-0.5 leading-relaxed text-[11px]">{n.message}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
