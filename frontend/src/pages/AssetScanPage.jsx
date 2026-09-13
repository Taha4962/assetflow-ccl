import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scanAssetByCode } from '../services/assetService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Package, ShieldCheck, AlertCircle, Wrench, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function AssetScanPage() {
  const { assetCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    scanAssetByCode(assetCode)
      .then(res => setAsset(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Asset not found or invalid QR code.'))
      .finally(() => setLoading(false));
  }, [assetCode]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner label="Verifying Asset QR Code..." /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-rose-900/10">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Invalid Asset</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={() => navigate('/')} className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const isAssignedToCurrentUser = user?.role === 'employee' && asset.assignments?.some(a => a.employeeId === user.id && a.isCurrent);
  const isManagerForThisDept = user?.role === 'department_manager' && user.departmentId === asset.departmentId;
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-slate-950 p-4 flex flex-col items-center py-10">
      <div className="max-w-md w-full space-y-4">
        {/* Verification Header */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-400 tracking-tight">Verified CCL Asset</h2>
          <p className="text-xs text-emerald-500/70">Scanned Successfully</p>
        </div>

        {/* Asset Info Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">{asset.name}</h1>
            <p className="font-mono text-blue-400 font-bold mt-1 text-lg">{asset.assetCode}</p>
          </div>

          <div className="space-y-4 border-t border-slate-800/50 pt-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Department</p>
                <p className="text-sm text-slate-200 font-semibold">{asset.department?.code}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Status</p>
                <p className="text-sm font-semibold capitalize text-amber-400">{asset.status.replace('_', ' ')}</p>
              </div>
              {asset.assignments?.[0]?.isCurrent && (
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Assigned To</p>
                  <p className="text-sm text-slate-200 font-semibold">{asset.assignments[0].employee?.fullName}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contextual Actions based on login status */}
        <div className="space-y-3 pt-2">
          {!user ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Log in to view full details or report an issue with this asset.</p>
              <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors">
                Log In
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {(isManagerForThisDept || isSuperAdmin) && (
                <button onClick={() => navigate(`/manager/assets/${asset.id}`)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" /> View Full Asset Details
                </button>
              )}
              {isAssignedToCurrentUser && (
                <button onClick={() => navigate('/employee/assets')}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <Wrench className="w-4 h-4" /> Report Issue
                </button>
              )}
              <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 font-bold text-sm transition-colors">
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
