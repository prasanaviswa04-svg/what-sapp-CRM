import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, Sparkles, Building, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = ({ onOpenMobile, onOpenSimulator, onOpenSearch, onOpenNotifications }) => {
  const { user, login, logout } = useAuth();
  const [userDropdown, setUserDropdown] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);

  const handleSwitchRole = async (email) => {
    setRoleDropdown(false);
    try {
      await login(email, 'Admin@12345');
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-amber-200/60 sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between relative shadow-2xs">
      {/* Left: Mobile Toggle, App Name & Global Search */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded-md text-zinc-600 hover:text-amber-950 hover:bg-amber-50/60 transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* App Name in Top Navigation with True Gold Accent */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 group select-none"
          title="EstateFlow CRM Home"
        >
          <span className="font-extrabold text-base sm:text-lg text-zinc-950 tracking-tight font-sans">
            Estate<span className="text-[#d4af37] group-hover:text-[#ffd700] transition-colors">Flow</span>
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#fffdf0] text-[#524100] border border-[#ffd700] uppercase shadow-2xs group-hover:bg-[#fef9c3] transition">
            CRM
          </span>
        </Link>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-200/60 bg-amber-50/20 hover:bg-amber-50/50 hover:border-amber-300 text-zinc-600 text-xs transition w-52 lg:w-60 group ml-1"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-700 transition" />
          <span className="flex-1 text-left tracking-tight">Search CRM...</span>
          <kbd className="text-[10px] bg-white border border-amber-200 px-1.5 py-0.2 rounded text-zinc-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Portal Switcher Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setRoleDropdown(!roleDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/70 text-xs font-semibold text-zinc-900 transition shadow-2xs"
            title="Switch Active Role Portal"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Portal: {user?.role || 'Company Admin'}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
          {roleDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <span className="block px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Select Role Portal
              </span>
              {[
                { role: 'Super Admin', email: 'superadmin@estateflow.io' },
                { role: 'Company Admin', email: 'admin@estateflow.io' },
                { role: 'Real Estate Manager', email: 'manager@estateflow.io' },
                { role: 'Property Broker', email: 'broker@estateflow.io' },
                { role: 'Sales Agent', email: 'agent@estateflow.io' },
                { role: 'Customer Support Agent', email: 'support@estateflow.io' }
              ].map((r) => (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => handleSwitchRole(r.email)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition ${
                    user?.role === r.role ? 'bg-zinc-100 font-bold text-zinc-950' : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span>{r.role}</span>
                  {user?.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp Webhook Simulator Button */}
        <Button
          onClick={onOpenSimulator}
          size="sm"
          variant="outline"
          icon={Sparkles}
          className="hidden sm:inline-flex bg-amber-50/40 border-amber-200/80 text-amber-900 hover:bg-amber-100/60"
        >
          WhatsApp Simulator
        </Button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-zinc-600 hover:text-[#786000] hover:bg-[#fffdf0] transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ffd700] rounded-full ring-2 ring-white" />
        </button>

        <div className="h-4 w-px bg-[#fef08a] hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#fffdf0] transition border border-transparent hover:border-[#ffd700]"
          >
            <div className="w-7 h-7 rounded-full bg-[#fef9c3] border border-[#ffd700] text-[#524100] font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 shadow-2xs">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.firstName} className="w-full h-full object-cover" />
              ) : (
                `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'S'}`
              )}
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
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setUserDropdown(false)}
            >
              <div className="px-3.5 py-2.5 border-b border-zinc-100 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.firstName} className="w-full h-full object-cover" />
                    ) : (
                      `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'S'}`
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 truncate">{user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                    <p className="text-zinc-500 truncate text-[11px]">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-700 font-medium bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
                  <Shield className="w-3 h-3 text-zinc-500" /> {user?.role}
                </div>
              </div>

              <a
                href="/settings"
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition"
              >
                <Building className="w-3.5 h-3.5 text-zinc-400" /> Profile & Settings
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
