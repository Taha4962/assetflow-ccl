import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDepartmentDetail } from '../../services/requestService';
import { format } from 'date-fns';
import { Building2, Users, Package, DollarSign, Activity, ChevronRight, ArrowLeft } from 'lucide-react';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  department_manager: 'Manager',
  purchase_person: 'Purchase Officer',
  maintenance_person: 'Maintenance',
  employee: 'Employee',
};

const UtilizationBar = ({ pct }) => {
  const color = pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full bg-slate-800 rounded-full h-2 mt-1">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
};

const STATUS_BADGE = {
  unassigned: 'bg-slate-600/30 text-slate-400',
  active: 'bg-emerald-500/10 text-emerald-400',
  under_maintenance: 'bg-amber-500/10 text-amber-400',
  disposed: 'bg-rose-500/10 text-rose-400',
};

const TABS = ['Staff', 'Assets', 'Budget', 'Activity'];

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Staff');

  useEffect(() => {
    getDepartmentDetail(id)
      .then(r => setDept(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><LoadingSpinner label="Loading department details..." /></Layout>;
  if (!dept) return <Layout><div className="text-red-400">Department not found.</div></Layout>;

  const budget = dept.budgets?.[0];
  const budgetPct = budget ? (Number(budget.usedBudget) / Number(budget.totalBudget)) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back & Header */}
        <div>
          <button onClick={() => navigate('/admin/departments')}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />Back to Departments
          </button>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Department Overview</span>
          <h1 className="text-2xl font-extrabold text-slate-100 mt-1">{dept.name}</h1>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{dept.code} — {dept.description}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Staff', value: dept.users?.length, icon: Users, color: 'text-blue-400' },
            { label: 'Assets', value: dept.assets?.length, icon: Package, color: 'text-violet-400' },
            { label: 'Pending Repairs', value: dept.pendingRepairs, icon: Activity, color: 'text-amber-400' },
            { label: 'Budget Set', value: budget ? `₹${Number(budget.totalBudget).toLocaleString('en-IN')}` : '—', icon: DollarSign, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
                  activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Staff' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Name', 'Role', 'Email', 'Status'].map(h => (
                    <th key={h} className="pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {dept.users?.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-200">{u.fullName}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-400">{ROLE_LABELS[u.role] || u.role}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-400 font-mono">{u.email}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Assets' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Asset Code', 'Name', 'Category', 'Status', 'Assigned To'].map(h => (
                    <th key={h} className="pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {dept.assets?.map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/20 transition-colors cursor-pointer" onClick={() => navigate(`/manager/assets/${a.id}`)}>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-blue-400 font-bold">{a.assetCode}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-200">{a.name}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-400">{a.category?.name}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_BADGE[a.status] || 'bg-slate-600/30 text-slate-400'}`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-400">
                      {a.assignments?.find(x => x.isCurrent)?.employee?.fullName || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Budget' && (
          <div className="space-y-4">
            {budget ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 max-w-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Current Month Budget</h3>
                  <span className="text-xs text-slate-500 font-mono">{budget.monthYear}</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Total Budget', value: budget.totalBudget, color: 'text-slate-200' },
                    { label: 'Used', value: budget.usedBudget, color: 'text-rose-400' },
                    { label: 'Remaining', value: budget.remainingBudget, color: 'text-emerald-400' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">{r.label}</span>
                      <span className={`font-bold font-mono ${r.color}`}>₹{Number(r.value).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Utilization</span>
                    <span className={`font-bold ${budgetPct >= 100 ? 'text-rose-400' : budgetPct >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{budgetPct.toFixed(1)}%</span>
                  </div>
                  <UtilizationBar pct={budgetPct} />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No budget set for this department this month.
              </div>
            )}
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="space-y-3">
            {dept.auditLogs?.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">No recent activity.</div>
            ) : dept.auditLogs?.map(log => (
              <div key={log.id} className="flex items-start gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-slate-200">{log.user?.fullName}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{log.action}</span>
                    {log.asset && <span className="text-[11px] text-slate-400">{log.asset.assetCode}</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{log.description}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
