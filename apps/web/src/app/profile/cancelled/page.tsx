'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, type Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/config/firebase';

type Request = { id: string; deviceName?: string; brand?: string; status?: string; cancelledAt?: Timestamp; cancellationReason?: string; };
const date = (item: Request) => item.cancelledAt?.toDate?.().toLocaleDateString('en-IN') || 'Recently';
export default function CancelledHistoryPage() {
  const [user, setUser] = useState<User | null>(null); const [sells, setSells] = useState<Request[]>([]); const [orders, setOrders] = useState<Request[]>([]);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => { if (!user) return; const watch = (name: 'orders' | 'sell_requests', set: (items: Request[]) => void) => onSnapshot(query(collection(db, name), where('userId', '==', user.uid)), (snapshot) => set(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Request)).filter((item) => item.status?.toLowerCase() === 'cancelled'))); const a = watch('sell_requests', setSells); const b = watch('orders', setOrders); return () => { a(); b(); }; }, [user]);
  const section = (items: Request[], kind: 'orders' | 'sell_requests') => <section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Cancelled {kind === 'orders' ? 'Order Requests' : 'Sell Requests'}</h2>{items.length ? <div className="mt-4 grid gap-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-[#FECACA] bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold text-[#1E1B29]">{kind === 'orders' ? item.deviceName || 'Device order' : `${item.brand || ''} ${item.deviceName || 'Device sale'}`}</h3><p className="mt-1 text-sm text-[#6E6683]">Request #{item.id.slice(0, 8)} · Cancelled {date(item)}</p><p className="mt-1 text-sm text-[#6E6683]">Reason: {item.cancellationReason || 'Cancelled by customer'}</p></div><span className="h-fit rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Cancelled</span></div><Link href={kind === 'orders' ? `/track-purchase?order=${item.id}` : `/track?order=${item.id}`} className="mt-4 inline-block font-bold text-[#5B21B6]">View details →</Link></article>)}</div> : <p className="mt-4 rounded-2xl bg-[#FAF7FF] p-5 text-[#6E6683]">No cancelled requests.</p>}</section>;
  return <main className="mx-auto max-w-5xl px-4 py-10"><Link href="/profile" className="font-bold text-[#5B21B6]">← Back to Profile</Link><h1 className="mt-5 text-3xl font-black text-[#1E1B29]">Cancelled History</h1><p className="mt-2 text-[#6E6683]">Cancelled requests are retained here for your reference.</p>{section(sells, 'sell_requests')}{section(orders, 'orders')}</main>;
}
