import React, { useState } from 'react';
import { Menu, Search, Bell, Sparkles, User, LogOut, ChevronDown, Building, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = ({ onOpenMobile, onOpenSimulator, onOpenSearch, onOpenNotifications }) => {
  const { user, logout } = useAuth();
  const [userDropdown, setUserDropdown] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-zinc-200/80 sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded-md text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 text-zinc-500 text-xs transition w-60 group"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 transition" />
          <span className="flex-1 text-left tracking-tight">Search CRM...</span>
          <kbd className="text-[10px] bg-white border border-zinc-200 px-1.5 py-0.2 rounded text-zinc-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* WhatsApp Webhook Simulator Button */}
        <Button
          onClick={onOpenSimulator}
          size="sm"
          variant="primary"
          icon={Sparkles}
          className="hidden sm:inline-flex"
        >
          WhatsApp Simulator
        </Button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-zinc-950 rounded-full" />
        </button>

        <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-zinc-50 transition border border-transparent hover:border-zinc-200"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center text-xs">
              {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'S'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-900 leading-tight tracking-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                {user?.role || 'Company Admin'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {userDropdown && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setUserDropdown(false)}
            >
              <div className="px-3.5 py-2 border-b border-zinc-100 text-xs">
                <p className="font-semibold text-zinc-900">{user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                <p className="text-zinc-500 truncate text-[11px]">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-700 font-medium">
                  <Shield className="w-3 h-3" /> {user?.role}
                </div>
              </div>

              <a
                href="/settings"
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition"
              >
                <Building className="w-3.5 h-3.5 text-zinc-400" /> Settings
              </a>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-900 hover:bg-zinc-50 transition text-left border-t border-zinc-100"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-400" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
