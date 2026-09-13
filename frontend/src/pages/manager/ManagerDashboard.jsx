import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getManagerDashboard } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { Package, UserCheck, Wrench, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getManagerDashboard();
      setData(res.data.data);
    } catch (err) {
      setError('Failed to load department dashboard metrics');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Layout><LoadingSpinner label="Compiling departmental metrics..." /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} onRetry={fetchData} /></Layout>;
  if (!data) return <Layout>No data available</Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Department Operations</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Department Manager Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Asset Allocation & Maintenance Overview for your department.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Department Assets" value={data.totalAssets} icon={Package} description="Registered in the system" color="blue" />
          <StatCard title="Active Assignments" value={data.assignedAssets} icon={UserCheck} description="Currently used by staff" color="emerald" />
          <StatCard title="Unassigned Assets" value={data.unassignedAssets.length} icon={Package} description="Ready for allocation" color="purple" />
          <StatCard title="Under Maintenance" value={data.underMaintenanceCount} icon={Wrench} description="Currently being repaired" color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* Asset Categories */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Assets by Category</h3>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.assetsByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="category">
                    {data.assetsByCategory?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', color: '#cbd5e1'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Status Overview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Asset Status Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.assetsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => v.replace('_', ' ')} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.assetsByStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
