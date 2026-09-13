import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getAdminDashboard } from '../../services/dashboardService';
import { Users, Building2, Package, Wrench, ShieldAlert, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAdminDashboard();
      const payload = res?.data?.data ?? {};
      const assetsByDepartment = (payload.deptAssetCounts || payload.assetsByDepartment || []).map((item) => ({
        code: item.code || item.department?.code || item.department?.name || 'Unknown',
        name: item.name || item.department?.name || 'Unknown',
        count: Number(item.count || 0),
      }));
      setData({ ...payload, assetsByDepartment });
    } catch (err) {
      setError('Failed to load administrator metrics');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Layout><LoadingSpinner label="Compiling system metrics..." /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} onRetry={fetchData} /></Layout>;
  if (!data) return <Layout>No data available</Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">System Administration</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Super Admin Executive Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Organization-wide departmental management dashboard</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Staff Users" value={data.totalUsers} icon={Users} description="Active across all departments" color="blue" />
          <StatCard title="CCL Departments" value={data.totalDepartments} icon={Building2} description="Operational wings & divisions" color="purple" />
          <StatCard title="Total Assets" value={data.totalAssets} icon={Package} description="Registered in the system" color="emerald" />
          <StatCard title="Pending Repairs" value={data.pendingRepairs} icon={Wrench} description="Awaiting maintenance action" color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* Department Asset Distribution */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Asset Distribution by Department</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.assetsByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="code" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.assetsByDepartment?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Status Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Asset Status Breakdown</h3>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.assetsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="status">
                    {data.assetsByStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', color: '#cbd5e1'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {['Users', 'Departments', 'Categories', 'Settings'].map((item) => (
            <div key={item} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center hover:bg-slate-800 transition-colors cursor-pointer">
              <p className="text-xs font-bold text-slate-300">Manage {item}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
