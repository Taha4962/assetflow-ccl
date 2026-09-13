import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  FileSpreadsheet,
  ShoppingBag,
  Wrench,
  UserCheck,
  DollarSign,
  Package,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const roleMenus = {
    super_admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Departments', path: '/admin/departments', icon: Building2 },
      { name: 'Asset Categories', path: '/admin/categories', icon: FolderTree },
      { name: 'Budget Management', path: '/admin/budgets', icon: DollarSign },
      { name: 'Warehouse Stock', path: '/admin/stock', icon: Package },
    ],
    department_manager: [
      { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
      { name: 'Asset Requests', path: '/manager/asset-requests', icon: FileSpreadsheet },
      { name: 'Department Assets', path: '/manager/assets', icon: ShoppingBag },
    ],
    purchase_person: [
      { name: 'Dashboard', path: '/purchase/dashboard', icon: LayoutDashboard },
      { name: 'Purchase Requests', path: '/purchase/requests', icon: FileSpreadsheet },
      { name: 'Registered Assets', path: '/purchase/assets', icon: ShoppingBag },
      { name: 'Stock & Warehouse', path: '/purchase/stock', icon: Package },
    ],
    maintenance_person: [
      { name: 'Dashboard', path: '/maintenance/dashboard', icon: LayoutDashboard },
      { name: 'Repair Requests', path: '/maintenance/requests', icon: Wrench },
    ],
    employee: [
      { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
      { name: 'My Assets', path: '/employee/assets', icon: UserCheck },
      { name: 'My Repairs', path: '/employee/repair-requests', icon: Wrench },
    ],
  };

  const navItems = roleMenus[user.role] || [];

  return (
    <aside className="w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Main Navigation
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
