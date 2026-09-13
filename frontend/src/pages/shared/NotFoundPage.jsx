import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-100 tracking-tight">404 - Page Not Found</h1>
        <p className="text-xs text-slate-400">
          The page or resource you requested does not exist or has been relocated within the CCL AssetFlow portal.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          <Home className="w-4 h-4" />
          <span>Return to Login / Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
