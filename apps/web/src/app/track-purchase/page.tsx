'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/config/firebase';

type Order = { deviceName?: string; price?: number; status?: string; deliveryAddress?: string; createdAt?: { seconds?: number } };

export default function TrackPurchasePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('Checking your order…');

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) { setMessage('Sign in with the account used to place this order.'); return; }
    if (!orderId) { setMessage('An order reference is required.'); return; }
    getDoc(doc(db, 'orders', orderId)).then((snapshot) => {
      if (!snapshot.exists()) { setMessage('Order not found, or it belongs to another account.'); return; }
      setOrder(snapshot.data() as Order);
      setMessage('');
    }).catch(() => setMessage('This order belongs to another account, or is unavailable.'));
  }, [orderId, user]);

  return <main className="min-h-screen bg-[#FAF7FF] px-4 py-10 sm:py-16"><section className="mx-auto max-w-lg rounded-3xl border border-[#E3D9F9] bg-white p-6 sm:p-8 shadow-sm">
    <p className="text-sm font-bold uppercase tracking-wide text-[#7C3AED]">Purchase tracking</p>
    <h1 className="mt-2 text-2xl font-black text-[#1E1B29]">Your order status</h1>
    {order ? <div className="mt-6 space-y-4"><div className="rounded-2xl bg-[#F3ECFF] p-4"><p className="font-bold text-[#1E1B29]">{order.deviceName || 'Device order'}</p><p className="mt-1 text-sm text-[#6E6683]">Order #{orderId}</p></div><div className="flex items-center justify-between border-b border-[#EFE9FB] pb-4"><span className="text-[#6E6683]">Status</span><strong className="rounded-full bg-[#FEF3C7] px-3 py-1 text-sm text-[#92400E]">{order.status || 'Pending Delivery'}</strong></div><p className="text-sm text-[#6E6683]">Delivery address: {order.deliveryAddress || 'Saved with your order'}</p></div> : <p className="mt-6 rounded-xl bg-[#FAF7FF] p-4 text-sm text-[#6E6683]">{message}</p>}
    <Link href="/profile" className="mt-6 inline-flex rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white">View account history</Link>
  </section></main>;
}
