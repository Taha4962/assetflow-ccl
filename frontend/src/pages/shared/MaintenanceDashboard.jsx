import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getMaintenanceDashboard } from '../../services/dashboardService';
import { Wrench, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function MaintenanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getMaintenanceDashboard();
      const payload = res?.data?.data ?? res?.data ?? {};
      setData({
        totalHandled: payload.totalHandled ?? payload.total ?? 0,
        pendingRequests: payload.pendingRequests ?? 0,
        inProgressRequests: payload.inProgressRequests ?? 0,
        resolvedRequests: payload.resolvedRequests ?? payload.resolvedThisMonth ?? 0,
        requestsByStatus: Array.isArray(payload.requestsByStatus) ? payload.requestsByStatus : [],
        requestsByUrgency: Array.isArray(payload.requestsByUrgency) ? payload.requestsByUrgency : [],
      });
    } catch (err) { setError('Failed to load maintenance metrics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Layout><LoadingSpinner label="Compiling maintenance metrics..." /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} onRetry={fetchData} /></Layout>;
  if (!data) return <Layout>No data available</Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Maintenance & Repairs</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Technician Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Handled" value={data.totalHandled} icon={Wrench} description="Lifetime requests" color="blue" />
          <StatCard title="Pending" value={data.pendingRequests} icon={Clock} description="Awaiting action" color="amber" />
          <StatCard title="In Progress" value={data.inProgressRequests} icon={AlertCircle} description="Currently fixing" color="blue" />
          <StatCard title="Resolved" value={data.resolvedRequests} icon={CheckCircle} description="Successfully fixed" color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Requests by Status</h3>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.requestsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="status">
                    {data.requestsByStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', color: '#cbd5e1', textTransform: 'capitalize'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Requests by Urgency</h3>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.requestsByUrgency} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="urgency">
                    {data.requestsByUrgency?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', color: '#cbd5e1', textTransform: 'capitalize'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
