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

  // Listen for real-time notifications via Socket
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

  const getIcon = (type) => {
    switch (type) {
      case 'new_lead':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'whatsapp_message':
        return <MessageSquare className="w-4 h-4 text-teal-500" />;
      case 'appointment_scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'ai_escalation':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 transition hover:bg-slate-50 flex items-start gap-3 ${
                  !n.isRead ? 'bg-teal-50/30' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-100 mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-800">{n.title}</div>
                  <div className="text-slate-500 mt-0.5 leading-relaxed">{n.message}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
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
