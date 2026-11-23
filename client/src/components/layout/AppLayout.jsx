import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { NotificationDrawer } from './NotificationDrawer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { WebhookSimulatorModal } from '../whatsapp/WebhookSimulatorModal';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex relative">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isCollapsed ? 'lg:pl-16' : 'lg:pl-60'
        }`}
      >
        <Navbar
          onOpenMobile={() => setIsMobileOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {typeof window !== 'undefined' && localStorage.getItem('estateflow_offline_active') === 'true' && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 text-xs text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <span>⚡</span>
              <span><strong>Standalone Mode (PC Off):</strong> All features, properties, customer matching &amp; WhatsApp operate directly on your phone.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('estateflow_offline_active');
                window.location.reload();
              }}
              className="text-[11px] underline font-semibold text-emerald-800 hover:text-emerald-950 ml-2 whitespace-nowrap"
            >
              Check Live Server
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Overlays / Modals */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
};
