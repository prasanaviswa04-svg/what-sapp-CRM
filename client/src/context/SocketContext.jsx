import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { isMobileNative } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const isExternalWeb = typeof window !== 'undefined' && (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app'));
    const savedHost = (typeof window !== 'undefined' && (localStorage.getItem('estateflow_api_host') || localStorage.getItem('estateflow_server_host'))) || null;
    const socketUrl = isMobileNative() || isExternalWeb
      ? (savedHost ? savedHost.replace(/\/api\/?$/, '').replace(/\/$/, '') : (import.meta.env.VITE_SERVER_URL || 'http://10.1.40.60:5000'))
      : window.location.origin;

    // Connect to server (using origin or fallback localhost:5000)
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket.IO connected:', newSocket.id);
      const companyId = user.companyId?._id || user.companyId || user.company?._id;
      if (companyId) {
        newSocket.emit('join_company', companyId);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context?.socket || null;
};
