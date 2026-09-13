import React, { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import api from '../../services/api';

const developerLoginConfigPath = import.meta.env.VITE_DEV_LOGIN_CONFIG_PATH;

export default function DeveloperLoginPage() {
  const [accounts, setAccounts] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/auth${developerLoginConfigPath}`)
      .then((response) => setAccounts(response.data.data || []))
      .catch(() => {
        setError(true);
        setAccounts([]);
      });
  }, []);

  if (accounts === null) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading developer login...</div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-2 text-center text-slate-400"><p>Developer login is unavailable.</p><p className="text-sm text-slate-500">Restart the backend and frontend development servers after changing environment files.</p></div>;

  return <LoginPage developerMode demoAccounts={accounts} />;
}