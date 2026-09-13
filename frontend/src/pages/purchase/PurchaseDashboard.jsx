import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getPurchaseDashboard } from '../../services/dashboardService';
import { Package, CreditCard, Building2, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const toNumber = (value) => Number(value || 0);

export default function PurchaseDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getPurchaseDashboard();
      setData(res.data.data);
    } catch (err) { setError('Failed to load purchase metrics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Layout><LoadingSpinner label="Compiling procurement metrics..." /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} onRetry={fetchData} /></Layout>;
  if (!data) return <Layout>No data available</Layout>;

  const recentPurchases = data.recentPurchases || [];
  const spendByDepartment = recentPurchases.reduce((acc, purchase) => {
    const code = purchase.department?.code || 'UNK';
    const total = toNumber(purchase.purchaseDetail?.totalAmount || purchase.totalAmount || 0);

    if (!acc[code]) {
      acc[code] = { code, total: 0 };
    }

    acc[code].total += total;
    return acc;
  }, {});

  const purchasesByCategory = recentPurchases.reduce((acc, purchase) => {
    const categoryName = purchase.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = { category: categoryName, count: 0 };
    }
    acc[categoryName].count += 1;
    return acc;
  }, {});

  const departmentChartData = Object.values(spendByDepartment).sort((a, b) => b.total - a.total);
  const categoryChartData = Object.values(purchasesByCategory).sort((a, b) => b.count - a.count);
  const totalMonthlySpend = toNumber(data.monthlyValue);
  const totalPurchased = recentPurchases.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Procurement & Financials</span>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">Purchasing Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Monthly Assets" value={data.monthlyAssets ?? totalPurchased} icon={Package} description="This month" color="violet" />
          <StatCard title="Monthly Spend" value={`₹${totalMonthlySpend.toLocaleString('en-IN')}`} icon={CreditCard} description="Current month expenditure" color="rose" />
          <StatCard title="Recent Purchases" value={recentPurchases.length} icon={Building2} description="Registered in system" color="blue" />
          <StatCard title="Pending Requests" value={data.pendingRequests ?? 0} icon={ShoppingCart} description="Awaiting purchase" color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Spend by Department</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData.length ? departmentChartData : [{ code: 'N/A', total: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="code" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} formatter={(value) => [`₹${toNumber(value).toLocaleString('en-IN')}`, 'Spend']} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {(departmentChartData.length ? departmentChartData : [{ code: 'N/A', total: 0 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-100 mb-6">Assets by Category</h3>
            <div className="flex-1 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChartData.length ? categoryChartData : [{ category: 'No data', count: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" nameKey="category">
                    {(categoryChartData.length ? categoryChartData : [{ category: 'No data', count: 1 }]).map((entry, index) => (
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

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Recent Purchases</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentPurchases.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No purchase records yet.</td></tr>
                ) : recentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-100">{purchase.name}</td>
                    <td className="px-4 py-3 text-slate-300">{purchase.department?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">{purchase.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">{purchase.purchaseDetail?.vendorName || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-violet-300">
                      ₹{toNumber(purchase.purchaseDetail?.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
