"use client";

import { useState } from "react";
import Link from "next/link";

interface SuccessModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, orderId, onClose }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B29]/60 backdrop-blur-sm p-4 font-space">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-[#ECFDF3] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#039855]">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#1E1B29] mb-3">Device Submitted!</h2>
        <p className="text-[#6E6683] mb-6 text-sm">
          Your request has been received. Please save your Order ID below to track its status.
        </p>

        {/* Order ID Box */}
        <div className="bg-[#FAF7FF] border border-[#EFE9FB] rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="text-left">
            <div className="text-[0.7rem] font-bold text-[#A79CBE] uppercase tracking-wider mb-1">Order ID</div>
            <div className="font-mono font-bold text-[#1E1B29]">{orderId}</div>
          </div>
          <button 
            onClick={handleCopy}
            className="p-2 bg-white rounded-lg border border-[#E3D9F9] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors text-sm font-semibold text-[#6E6683]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/track"
            onClick={onClose}
            className="w-full bg-[#5B21B6] text-white py-3.5 rounded-xl font-bold hover:bg-[#3D1E7A] transition-colors text-center"
          >
            Track Order Now
          </Link>
          <button 
            onClick={onClose}
            className="w-full bg-white text-[#6E6683] border-[1.5px] border-[#EFE9FB] py-3.5 rounded-xl font-bold hover:bg-[#FAF7FF] hover:text-[#1E1B29] transition-colors"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
