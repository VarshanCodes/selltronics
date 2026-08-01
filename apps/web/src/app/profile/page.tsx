'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where, type Timestamp } from 'firebase/firestore';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/config/firebase';

type Request = { id: string; deviceName?: string; brand?: string; price?: number; expectedPrice?: number; status?: string; createdAt?: Timestamp; submittedAt?: Timestamp; deliveryAddress?: string; locationAddress?: string; customerPhone?: string; whatsappNumber?: string; landmark?: string; pincode?: string };
const cancelled = (item: Request) => item.status?.toLowerCase() === 'cancelled';
const editable = (item: Request) => ['pending delivery', 'pending', 'pickup_requested', 'pickup requested'].includes((item.status || '').toLowerCase());
const when = (item: Request) => (item.createdAt || item.submittedAt)?.toDate?.().toLocaleDateString('en-IN') || 'Recently';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sells, setSells] = useState<Request[]>([]);
  const [orders, setOrders] = useState<Request[]>([]);
  const [primaryAddress, setPrimaryAddress] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ kind: 'orders' | 'sell_requests'; request: Request } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (current) => { setUser(current); setLoading(false); }), []);
  useEffect(() => {
    if (!user) return;
    const options = (name: 'orders' | 'sell_requests', set: (items: Request[]) => void) => onSnapshot(query(collection(db, name), where('userId', '==', user.uid)), (snapshot) => set(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Request)).sort((a, b) => (b.createdAt?.seconds || b.submittedAt?.seconds || 0) - (a.createdAt?.seconds || a.submittedAt?.seconds || 0))), (issue) => { console.error(`Could not load ${name}`, issue); setError('We could not load your requests. Please sign out and sign in again.'); });
    const stopOrders = options('orders', setOrders);
    const stopSells = options('sell_requests', setSells);
    return () => { stopOrders(); stopSells(); };
  }, [user]);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => setPrimaryAddress(String(snapshot.data()?.address || 'No primary address saved yet')));
  }, [user]);

  const activeSells = useMemo(() => sells.filter((item) => !cancelled(item)), [sells]);
  const activeOrders = useMemo(() => orders.filter((item) => !cancelled(item)), [orders]);
  const cancelledCount = sells.length + orders.length - activeSells.length - activeOrders.length;
  const cancel = async (kind: 'orders' | 'sell_requests', id: string) => {
    if (!window.confirm('Cancel this request? It will be retained in Cancelled History.')) return;
    await updateDoc(doc(db, kind, id), { status: 'Cancelled', cancelledAt: new Date(), updatedAt: new Date() });
  };
  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const request = editing.request;
      const payload = editing.kind === 'orders'
        ? { deliveryAddress: request.deliveryAddress || '', customerPhone: request.customerPhone || '', whatsappNumber: request.whatsappNumber || '', landmark: request.landmark || '', pincode: request.pincode || '', updatedAt: new Date() }
        : { locationAddress: request.locationAddress || '', customerPhone: request.customerPhone || '', whatsappNumber: request.whatsappNumber || '', landmark: request.landmark || '', pincode: request.pincode || '', updatedAt: new Date() };
      await updateDoc(doc(db, editing.kind, request.id), payload);
      setEditing(null);
    } catch (issue) { console.error('Could not update request', issue); setError('The request could not be updated. Please try again.'); }
    finally { setSaving(false); }
  };
  const cards = (items: Request[], kind: 'orders' | 'sell_requests') => items.length ? <div className="mt-4 grid gap-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-[#E3D9F9] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-[#1E1B29]">{kind === 'orders' ? item.deviceName || 'Device order' : `${item.brand || ''} ${item.deviceName || 'Device sale'}`}</h3><p className="mt-1 text-sm text-[#6E6683]">Request #{item.id.slice(0, 8)} · {when(item)} · ₹{Number(kind === 'orders' ? item.price : item.expectedPrice || 0).toLocaleString('en-IN')}</p></div><span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#92400E]">{(item.status || 'Pending').replaceAll('_', ' ')}</span></div><div className="mt-4 flex flex-wrap gap-3"><Link href={kind === 'orders' ? `/track-purchase?order=${item.id}` : `/track?order=${item.id}`} className="rounded-lg border border-[#D8C8F6] px-3 py-2 text-sm font-bold text-[#5B21B6]">View details</Link>{editable(item) && <><button onClick={() => setEditing({ kind, request: { ...item } })} className="rounded-lg border border-[#D8C8F6] px-3 py-2 text-sm font-bold text-[#5B21B6]">Edit address</button><button onClick={() => cancel(kind, item.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Cancel request</button></>}</div></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[#E3D9F9] bg-[#FAF7FF] p-6 text-sm font-semibold text-[#6E6683]">No active {kind === 'orders' ? 'order' : 'sell'} requests.</div>;

  if (loading) return <main className="grid min-h-[60vh] place-items-center text-[#5B21B6]"><span className="animate-pulse font-bold">Loading your profile…</span></main>;
  if (!user) return <main className="mx-auto my-16 max-w-md rounded-3xl border border-[#E3D9F9] bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F3ECFF] text-xl">G</div><h1 className="mt-4 text-2xl font-black text-[#1E1B29]">Your Profile</h1><p className="mt-2 text-[#6E6683]">Sign in to manage your sell and order requests.</p><button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="mt-6 rounded-xl bg-[#5B21B6] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#6D28D9]">Continue with Google</button></main>;
  return <main className="mx-auto max-w-5xl px-4 py-10"><header className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#5B21B6] font-black text-white">{user.displayName?.slice(0, 1).toUpperCase() || 'U'}</div><div><h1 className="text-2xl font-black text-[#1E1B29]">Your Profile</h1><p className="text-sm text-[#6E6683]">{user.email}</p></div></div><button onClick={() => signOut(auth)} className="rounded-xl border border-[#E3D9F9] px-4 py-2 font-bold text-[#5B21B6]">Sign out</button></header>{error && <p className="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}<section className="mt-8 rounded-3xl border border-[#E3D9F9] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wide text-[#7C3AED]">Contact & pickup details</p><h2 className="mt-2 text-xl font-black text-[#1E1B29]">{user.displayName || 'Your profile'}</h2><p className="mt-1 text-[#6E6683]">{primaryAddress}</p></div><Link href="/profile/edit" className="rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white transition hover:bg-[#6D28D9]">Edit Profile</Link></div><Link href="/profile/cancelled" className="mt-5 inline-flex items-center gap-2 font-bold text-[#5B21B6]">Cancelled History ({cancelledCount}) <span aria-hidden>→</span></Link></section><section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Sell Requests</h2>{cards(activeSells, 'sell_requests')}</section><section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Order Requests</h2>{cards(activeOrders, 'orders')}</section>{editing && <div className="fixed inset-0 z-50 grid place-items-center bg-[#1E1B29]/40 p-4"><form onSubmit={saveAddress} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"><h2 className="text-xl font-black text-[#1E1B29]">Edit request details</h2><p className="mt-1 text-sm text-[#6E6683]">The admin dashboard updates immediately.</p><div className="mt-5 grid gap-3"><input required value={editing.request.customerPhone || ''} onChange={(event) => setEditing((current) => current && { ...current, request: { ...current.request, customerPhone: event.target.value } })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Phone number" /><input required value={editing.request.whatsappNumber || ''} onChange={(event) => setEditing((current) => current && { ...current, request: { ...current.request, whatsappNumber: event.target.value } })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="WhatsApp number" /><textarea required value={editing.kind === 'orders' ? editing.request.deliveryAddress || '' : editing.request.locationAddress || ''} onChange={(event) => setEditing((current) => current && { ...current, request: { ...current.request, [current.kind === 'orders' ? 'deliveryAddress' : 'locationAddress']: event.target.value } })} className="min-h-24 rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Full address" /><input value={editing.request.landmark || ''} onChange={(event) => setEditing((current) => current && { ...current, request: { ...current.request, landmark: event.target.value } })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Landmark" /><input value={editing.request.pincode || ''} onChange={(event) => setEditing((current) => current && { ...current, request: { ...current.request, pincode: event.target.value } })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Pincode" /></div><div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white">{saving ? 'Saving…' : 'Save changes'}</button><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-[#E3D9F9] px-4 py-3 font-bold text-[#5B21B6]">Cancel</button></div></form></div>}</main>;
}
