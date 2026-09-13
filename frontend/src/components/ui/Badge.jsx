import React from 'react';

const Badge = ({ variant = 'default', children }) => {
  const styles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purchased: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    role: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  const selectedStyle = styles[variant] || styles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedStyle}`}>
      {children}
    </span>
  );
};

export default Badge;
