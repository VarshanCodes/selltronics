'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function OrderSuccessClient() {
  const orderId = useSearchParams().get('order');
  return <main className="flex min-h-screen items-center justify-center bg-[#FAF7FF] p-4"><section className="w-full max-w-xl rounded-3xl border border-[#E3D9F9] bg-white p-7 text-center shadow-sm sm:p-10"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#DCFCE7] text-3xl font-black text-[#15803D]">✓</div><p className="mt-6 text-sm font-bold uppercase tracking-wide text-[#7C3AED]">Order request received</p><h1 className="mt-2 text-3xl font-black text-[#1E1B29]">Order placed successfully</h1><p className="mt-3 text-[#6E6683]">We will confirm your order request shortly. Keep this reference for tracking.</p><div className="mt-6 rounded-2xl bg-[#F3ECFF] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#7C3AED]">Order ID</p><code className="mt-1 block break-all font-mono font-bold text-[#1E1B29]">{orderId || 'Unavailable'}</code></div><p className="mt-4 text-sm text-[#6E6683]">Estimated confirmation: within one business day.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href={`/track-purchase?order=${encodeURIComponent(orderId || '')}`} className="rounded-xl bg-[#5B21B6] px-5 py-3 font-bold text-white transition hover:bg-[#6D28D9]">Track Order</Link><Link href="/" className="rounded-xl border border-[#E3D9F9] px-5 py-3 font-bold text-[#1E1B29]">Back to Home</Link></div></section></main>;
}
