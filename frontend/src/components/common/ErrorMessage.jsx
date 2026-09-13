import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message = 'An error occurred', onRetry }) => {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-red-300 flex items-start space-x-3 my-4">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-200">System Error</h4>
        <p className="text-xs text-red-300/80 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs font-semibold text-red-400 hover:text-red-200 underline focus:outline-none"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
