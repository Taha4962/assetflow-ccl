import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';

const LoginPage = ({ developerMode = false, demoAccounts = [] }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email address and password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      toast.success(`Welcome back, ${result.user.fullName}!`);
      const targetPath = getRoleDashboardPath(result.user.role);
      navigate(targetPath, { replace: true });
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  const handleDemoFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    toast.info(`Filled credentials for ${acc.label}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-2xl shadow-xl shadow-blue-500/25 mb-2">
            C
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">AssetFlow</h1>
          <p className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            Central Coalfields Limited • Government of India
          </p>
          <p className="text-xs text-slate-400">Departmental Asset Management & Procurement Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ccl.gov.in"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wide shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {developerMode && (
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Developer Login Presets
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoFill(acc)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                  >
                    <p className="text-[11px] font-semibold text-slate-300 group-hover:text-blue-300">
                      {acc.label}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">{acc.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500">
          Central Coalfields Limited © 2026 • Security Enforced with JWT & Bcrypt
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
