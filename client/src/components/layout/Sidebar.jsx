import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Building2,
  MessageSquare,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useAuth();
  const role = user?.role || 'Company Admin';

  const getNavigationItems = () => {
    switch (role) {
      case 'Super Admin':
        return [
          { name: 'System Console', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Marketplace Submissions', path: '/marketplace-manager', icon: Store, badge: 'Submissions' },
          { name: 'Customers', path: '/customers', icon: Users },
          { name: 'Leads & Pipeline', path: '/leads', icon: GitBranch },
          { name: 'Properties', path: '/properties', icon: Building2 },
          { name: 'Connect WhatsApp', path: '/whatsapp', icon: MessageSquare },
          { name: 'Team & Admins', path: '/team', icon: UserCheck },
          { name: 'System Settings', path: '/settings', icon: Settings },
        ];
      case 'Real Estate Manager':
        return [
          { name: 'Operations Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Marketplace Submissions', path: '/marketplace-manager', icon: Store, badge: 'Submissions' },
          { name: 'Customers', path: '/customers', icon: Users },
          { name: 'Leads & Pipeline', path: '/leads', icon: GitBranch },
          { name: 'Properties', path: '/properties', icon: Building2 },
          { name: 'Connect WhatsApp', path: '/whatsapp', icon: MessageSquare },
          { name: 'Team Management', path: '/team', icon: UserCheck },
        ];
      case 'Property Broker':
        return [
          { name: 'Broker Portal', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Marketplace Submissions', path: '/marketplace-manager', icon: Store, badge: 'Submissions' },
          { name: 'My Properties', path: '/properties', icon: Building2 },
          { name: 'Leads Pipeline', path: '/leads', icon: GitBranch },
          { name: 'Client Database', path: '/customers', icon: Users },
          { name: 'Connect WhatsApp', path: '/whatsapp', icon: MessageSquare },
        ];
      case 'Sales Agent':
        return [
          { name: 'Agent Pipeline', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Leads & Pipeline', path: '/leads', icon: GitBranch },
          { name: 'Assigned Clients', path: '/customers', icon: Users },
          { name: 'Properties', path: '/properties', icon: Building2 },
          { name: 'Connect WhatsApp', path: '/whatsapp', icon: MessageSquare },
        ];
      case 'Customer Support Agent':
        return [
          { name: 'Support Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Connect WhatsApp', path: '/whatsapp', icon: MessageSquare },
          { name: 'Customer Directory', path: '/customers', icon: Users },
          { name: 'Properties Inventory', path: '/properties', icon: Building2 },
        ];
      case 'Company Admin':
      default:
        return [
          { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Marketplace Submissions', path: '/marketplace-manager', icon: Store, badge: 'Submissions' },
          { name: 'Customers', path: '/customers', icon: Users },
          { name: 'Leads & Pipeline', path: '/leads', icon: GitBranch },
          { name: 'Properties', path: '/properties', icon: Building2 },
          { name: 'Connect WhatsApp', path: '/whatsapp', icon: MessageSquare },
          { name: 'Team Management', path: '/team', icon: UserCheck },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
    }
  };

  const navigationItems = getNavigationItems();

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

      {/* Active Role Pill */}
      {!isCollapsed && (
        <div className="px-3 pt-2.5 pb-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Shield className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
              <span className="font-semibold text-zinc-900 truncate text-[11px]">{role}</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200/70 text-zinc-700 font-mono font-medium">Portal</span>
          </div>
        </div>
      )}

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
