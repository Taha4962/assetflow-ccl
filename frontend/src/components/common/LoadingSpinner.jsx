import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading data...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-slate-400 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-sm font-medium tracking-wide">{label}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;
