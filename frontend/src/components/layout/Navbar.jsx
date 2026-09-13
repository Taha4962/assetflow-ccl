import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, Building2 } from 'lucide-react';

const roleLabels = {
  super_admin: 'Super Admin',
  department_manager: 'Department Manager',
  purchase_person: 'Purchase Officer',
  maintenance_person: 'Maintenance Specialist',
  employee: 'Employee',
};

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
          C
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-100 text-lg tracking-tight">AssetFlow</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              CCL Portal
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Central Coalfields Limited • Govt of India
          </p>
        </div>
      </div>

      {/* Right: User Profile & Logout */}
      {user && (
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 border-r border-slate-800 pr-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
              <div className="flex items-center justify-end space-x-1.5 text-[10px] text-slate-400">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>{roleLabels[user.role] || user.role}</span>
                {user.department && (
                  <>
                    <span>•</span>
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{user.department.code}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
