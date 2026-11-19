import React, { useState } from 'react';
import { Menu, Search, Bell, Sparkles, User, LogOut, ChevronDown, Building, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = ({ onOpenMobile, onOpenSimulator, onOpenSearch, onOpenNotifications }) => {
  const { user, logout } = useAuth();
  const [userDropdown, setUserDropdown] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100/80 text-slate-500 text-xs transition w-64 group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
          <span className="flex-1 text-left">Search CRM...</span>
          <kbd className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* WhatsApp Webhook Simulator Button */}
        <Button
          onClick={onOpenSimulator}
          size="sm"
          variant="primary"
          icon={Sparkles}
          className="hidden sm:inline-flex bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-sm"
        >
          WhatsApp AI Simulator
        </Button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 text-teal-400 font-bold flex items-center justify-center text-xs">
              {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'S'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-teal-600 font-medium">
                {user?.role || 'Company Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setUserDropdown(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100 text-xs">
                <p className="font-semibold text-slate-800">{user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                <p className="text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-teal-700 font-medium">
                  <Shield className="w-3 h-3" /> {user?.role}
                </div>
              </div>

              <a
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                <Building className="w-3.5 h-3.5 text-slate-400" /> Company Settings
              </a>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
