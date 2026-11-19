import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Building2,
  Sparkles,
  MessageSquare,
  Bot,
  CalendarCheck,
  Zap,
  CheckSquare,
  Radio,
  CreditCard,
  BarChart3,
  UserCheck,
  Layers,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navigationItems = [
    { name: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Leads & Pipeline', path: '/leads', icon: GitBranch },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'AI Property Matching', path: '/matching', icon: Sparkles, badge: 'AI' },
    { name: 'WhatsApp Inbox', path: '/whatsapp', icon: MessageSquare, badge: 'Live' },
    { name: 'AI Assistant & KB', path: '/ai-assistant', icon: Bot },
    { name: 'Bookings & Visits', path: '/appointments', icon: CalendarCheck },
    { name: 'Follow-Up Automation', path: '/automations', icon: Zap },
    { name: 'Tasks & Reminders', path: '/tasks', icon: CheckSquare },
    { name: 'Campaigns & Broadcasts', path: '/campaigns', icon: Radio },
    { name: 'Payments & Transactions', path: '/payments', icon: CreditCard },
    { name: 'Reports & Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Team Management', path: '/team', icon: UserCheck },
    { name: 'Integrations & Meta API', path: '/integrations', icon: Layers },
    { name: 'Activity & Audit Logs', path: '/activity-logs', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Support', path: '/help', icon: HelpCircle },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy-950 text-slate-300 border-r border-navy-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-900 bg-navy-950/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 flex-shrink-0">
            <Building2 className="w-5 h-5 text-navy-950 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
                EstateFlow <span className="text-[10px] bg-teal-500/20 text-teal-400 border border-teal-500/30 px-1.5 py-0.2 rounded font-semibold">AI</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-1">Real Estate WhatsApp CRM</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-900/80'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.badge === 'Live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Status */}
      {!isCollapsed && (
        <div className="p-3 border-t border-navy-900 bg-navy-950/60">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-navy-900/60 border border-navy-800 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="truncate">Official Meta API: Connected</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-navy-950 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
