import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend, color = 'blue' }) => {
  const iconColors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-200 hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-2 tracking-tight">{value}</h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${iconColors[color] || iconColors.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
