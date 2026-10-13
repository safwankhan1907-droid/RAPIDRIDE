// components/Toast.tsx
"use client";

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-[#0e0a17]/95 border border-purple-500/40 px-5 py-4 rounded-2xl shadow-2xl shadow-purple-950/80 backdrop-blur-xl animate-bounce-short">
      {type === 'success' && <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />}
      {type === 'error' && <AlertCircle className="text-rose-400 shrink-0" size={20} />}
      {type === 'info' && <Info className="text-purple-400 shrink-0" size={20} />}
      
      <p className="text-xs font-mono font-medium text-purple-100 tracking-wider pr-2">
        {message}
      </p>

      <button
        onClick={onClose}
        className="text-purple-400 hover:text-white transition p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}