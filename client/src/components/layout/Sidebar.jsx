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
  ChevronRight
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
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-400 border-r border-zinc-900 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-900 bg-zinc-950">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-zinc-950 flex-shrink-0">
            <Building2 className="w-4 h-4 text-zinc-950 stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-tight leading-none flex items-center gap-1.5">
                ESTATEFLOW <span className="text-[9px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-1 py-0.2 rounded font-mono font-normal">CRM</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-tight mt-1">Minimalist Real Estate</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900 transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
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
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative tracking-tight ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-transform" />
              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
              {!isCollapsed && item.badge && (
                <span
                  className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
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
        <div className="p-3 border-t border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="truncate tracking-tight font-medium">Meta WhatsApp API Active</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-zinc-950 shadow-2xl z-50 animate-in slide-in-from-left duration-150">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
