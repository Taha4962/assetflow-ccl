import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getEmployeeDashboard } from '../../services/dashboardService';
import { Package, Wrench, MonitorSmartphone, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getEmployeeDashboard();
      const payload = res?.data?.data ?? res?.data ?? {};

      const assignedAssets = Array.isArray(payload.assignedAssets) ? payload.assignedAssets : [];
      const pendingRepairs = Array.isArray(payload.pendingRepairs) ? payload.pendingRepairs : [];
      const resolvedRepairs = Array.isArray(payload.resolvedRepairs) ? payload.resolvedRepairs : [];

      const assetsByCategory = assignedAssets.reduce((acc, item) => {
        const name = item?.asset?.category?.name || 'Uncategorized';
        const existing = acc.find((entry) => entry.category === name);
        if (existing) existing.count += 1;
        else acc.push({ category: name, count: 1 });
        return acc;
      }, []);

      const repairsByStatus = [...pendingRepairs, ...resolvedRepairs].reduce((acc, item) => {
        const status = item?.status || 'unknown';
        const key = status === 'resolved' ? 'resolved' : status;
        const existing = acc.find((entry) => entry.status === key);
        if (existing) existing.count += 1;
        else acc.push({ status: key, count: 1 });
        return acc;
      }, []);

      setData({
        activeAssignments: assignedAssets.length,
        pastAssignments: 0,
        pendingRepairs,
        totalRepairsRaised: pendingRepairs.length + resolvedRepairs.length,
        assetsByCategory,
        repairsByStatus,
      });
    } catch (err) { setError('Failed to load employee metrics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Layout><LoadingSpinner label="Compiling workspace metrics..." /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} onRetry={fetchData} /></Layout>;
  if (!data) return <Layout>No data available</Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">My Workspace</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Employee Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Assignments" value={data.activeAssignments ?? 0} icon={MonitorSmartphone} description="Assets currently held" color="teal" />
          <StatCard title="Past Assignments" value={data.pastAssignments ?? 0} icon={Package} description="Previously held assets" color="slate" />
          <StatCard title="Pending Repairs" value={Array.isArray(data.pendingRepairs) ? data.pendingRepairs.length : 0} icon={Clock} description="Awaiting fix" color="amber" />
          <StatCard title="Total Repairs Raised" value={data.totalRepairsRaised ?? 0} icon={Wrench} description="Lifetime requests" color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Assigned Assets by Category</h3>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                {Array.isArray(data.assetsByCategory) && data.assetsByCategory.length > 0 ? (
                  <PieChart>
                    <Pie data={data.assetsByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="category">
                      {data.assetsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', color: '#cbd5e1'}} />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">No assets assigned</div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Repair Requests by Status</h3>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                {Array.isArray(data.repairsByStatus) && data.repairsByStatus.length > 0 ? (
                  <PieChart>
                    <Pie data={data.repairsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="status">
                      {data.repairsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', color: '#cbd5e1', textTransform: 'capitalize'}} />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">No repairs requested</div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
