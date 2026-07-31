'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/config/firebase';

type Request = { brand?: string; deviceName?: string; expectedPrice?: number; status?: string; locationAddress?: string };

export default function TrackSellRequestPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('order');
  const [user, setUser] = useState<User | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [message, setMessage] = useState('Checking your sell request…');

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) { setMessage('Sign in with the account used to create this request.'); return; }
    if (!requestId) { setMessage('A request reference is required.'); return; }
    getDoc(doc(db, 'sell_requests', requestId)).then((snapshot) => {
      if (!snapshot.exists()) { setMessage('Request not found, or it belongs to another account.'); return; }
      setRequest(snapshot.data() as Request);
      setMessage('');
    }).catch(() => setMessage('This request belongs to another account, or is unavailable.'));
  }, [requestId, user]);

  return <main className="min-h-screen bg-[#FAF7FF] px-4 py-10 sm:py-16"><section className="mx-auto max-w-lg rounded-3xl border border-[#E3D9F9] bg-white p-6 sm:p-8 shadow-sm">
    <p className="text-sm font-bold uppercase tracking-wide text-[#7C3AED]">Sell request tracking</p>
    <h1 className="mt-2 text-2xl font-black text-[#1E1B29]">Your pickup status</h1>
    {request ? <div className="mt-6 space-y-4"><div className="rounded-2xl bg-[#F3ECFF] p-4"><p className="font-bold text-[#1E1B29]">{request.brand} {request.deviceName}</p><p className="mt-1 text-sm text-[#6E6683]">Request #{requestId}</p></div><div className="flex items-center justify-between border-b border-[#EFE9FB] pb-4"><span className="text-[#6E6683]">Status</span><strong className="rounded-full bg-[#FEF3C7] px-3 py-1 text-sm text-[#92400E]">{(request.status || 'Pickup requested').replaceAll('_', ' ')}</strong></div><p className="text-sm text-[#6E6683]">Pickup address: {request.locationAddress || 'Saved with your request'}</p></div> : <p className="mt-6 rounded-xl bg-[#FAF7FF] p-4 text-sm text-[#6E6683]">{message}</p>}
    <Link href="/profile" className="mt-6 inline-flex rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white">View account history</Link>
  </section></main>;
}
