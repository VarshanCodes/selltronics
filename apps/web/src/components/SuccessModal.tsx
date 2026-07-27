"use client";

interface SuccessModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, orderId, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1E1B29]/70 px-4">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3ECFF] text-3xl text-[#5B21B6]">
          ✓
        </div>
        <h3 className="text-center text-2xl font-bold text-[#1E1B29]">
          Submitted successfully
        </h3>
        <p className="mt-3 text-center text-sm text-[#6E6683]">
          Your sell request has been received. Your order ID is{' '}
          <span className="font-semibold text-[#1E1B29]">{orderId}</span>.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#5B21B6] px-4 py-3 font-semibold text-white transition hover:bg-[#4C1D95]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
