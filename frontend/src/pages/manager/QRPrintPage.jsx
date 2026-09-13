import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAssetById, getAssetQR } from '../../services/assetService';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function QRPrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAssetById(id), getAssetQR(id)])
      .then(([assetRes, qrRes]) => {
        setAsset(assetRes.data.data);
        setQrCode(qrRes.data.data.qrCode);
      })
      .catch(() => toast.error('Failed to load QR code'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Layout><LoadingSpinner label="Generating QR Code..." /></Layout>;
  if (!asset) return <Layout><div className="text-center text-slate-400 mt-20">Asset not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header - Hidden on print */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 print:hidden">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center space-x-1 text-slate-500 hover:text-slate-300 text-xs mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /><span>Back</span>
            </button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Asset Identity</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">QR Code Label</h1>
          </div>
          <button onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2">
            <Printer className="w-4 h-4" /><span>Print Label</span>
          </button>
        </div>

        {/* Print Container */}
        <div className="flex flex-col items-center justify-center py-10 print:py-0">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-slate-200 print:shadow-none print:border-none print:p-0">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">CCL Asset</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{asset.department?.code} Department</p>
            </div>
            
            <div className="flex justify-center mb-6">
              {qrCode ? (
                <img src={qrCode} alt="Asset QR Code" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                  No QR Code
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <p className="font-mono text-xl font-bold text-slate-900">{asset.assetCode}</p>
              <p className="text-sm font-semibold text-slate-600 leading-tight">{asset.name}</p>
              <p className="text-xs text-slate-500 mt-2">Scan to view details or raise repair request</p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              .print\\:hidden { display: none !important; }
              .bg-slate-950 { background: white !important; }
              .max-w-3xl { max-width: 100% !important; margin: 0 !important; }
              .bg-white { 
                visibility: visible; 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              .bg-white * { visibility: visible; }
            }
          `
        }} />
      </div>
    </Layout>
  );
}
