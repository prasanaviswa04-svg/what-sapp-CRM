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
    <div className="flex flex-col h-full bg-white text-zinc-600 border-r border-zinc-200 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Building2 className="w-4 h-4 text-white stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-zinc-950 text-sm tracking-tight leading-none flex items-center gap-1.5">
                ESTATEFLOW <span className="text-[9px] bg-zinc-100 text-zinc-700 border border-zinc-200 px-1 py-0.2 rounded font-mono font-medium">CRM</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-1">Light Minimalist Real Estate</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
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
                    ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200/80 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-transform text-zinc-500 group-hover:text-zinc-950" />
              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
              {!isCollapsed && item.badge && (
                <span
                  className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
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
        <div className="p-3 border-t border-zinc-200 bg-white">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-150">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
