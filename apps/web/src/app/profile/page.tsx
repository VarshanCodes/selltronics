'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where, type Timestamp } from 'firebase/firestore';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/config/firebase';

type Kind = 'orders' | 'sell_requests' | 'repair_requests';
type Request = {
  id: string; deviceName?: string; brand?: string; model?: string; service?: string; price?: number; expectedPrice?: number; status?: string;
  createdAt?: Timestamp; submittedAt?: Timestamp; deliveryAddress?: string; locationAddress?: string; customerAddress?: string;
  customerPhone?: string; whatsappNumber?: string; customerWhatsapp?: string; landmark?: string; pincode?: string; customerPincode?: string;
};

const cancelled = (item: Request) => item.status?.toLowerCase() === 'cancelled';
const editable = (item: Request) => ['pending delivery', 'pending', 'pending_pickup', 'pickup_requested', 'pickup requested'].includes((item.status || '').toLowerCase());
const when = (item: Request) => (item.createdAt || item.submittedAt)?.toDate?.().toLocaleDateString('en-IN') || 'Recently';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sells, setSells] = useState<Request[]>([]);
  const [orders, setOrders] = useState<Request[]>([]);
  const [repairs, setRepairs] = useState<Request[]>([]);
  const [primaryAddress, setPrimaryAddress] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ kind: Kind; request: Request } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (current) => { setUser(current); setLoading(false); }), []);

  useEffect(() => {
    if (!user) return;
    const subscribe = (kind: Kind, setItems: (items: Request[]) => void) => onSnapshot(
      query(collection(db, kind), where('userId', '==', user.uid)),
      (snapshot) => setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Request)).sort((a, b) => (b.createdAt?.seconds || b.submittedAt?.seconds || 0) - (a.createdAt?.seconds || a.submittedAt?.seconds || 0))),
      (issue) => { console.error(`Could not load ${kind}`, issue); setError('We could not load your requests. Please sign out and sign in again.'); }
    );
    const stopOrders = subscribe('orders', setOrders);
    const stopSells = subscribe('sell_requests', setSells);
    const stopRepairs = subscribe('repair_requests', setRepairs);
    return () => { stopOrders(); stopSells(); stopRepairs(); };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => setPrimaryAddress(String(snapshot.data()?.address || 'No primary address saved yet')));
  }, [user]);

  const activeSells = useMemo(() => sells.filter((item) => !cancelled(item)), [sells]);
  const activeOrders = useMemo(() => orders.filter((item) => !cancelled(item)), [orders]);
  const activeRepairs = useMemo(() => repairs.filter((item) => !cancelled(item)), [repairs]);
  const cancelledCount = sells.length + orders.length + repairs.length - activeSells.length - activeOrders.length - activeRepairs.length;

  const cancel = async (kind: Kind, id: string) => {
    if (!window.confirm('Cancel this request? It will be retained in Cancelled History.')) return;
    try { await updateDoc(doc(db, kind, id), { status: 'Cancelled', cancelledAt: new Date(), updatedAt: new Date() }); }
    catch (issue) { console.error('Could not cancel request', issue); setError('The request could not be cancelled. Please try again.'); }
  };

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const { kind, request } = editing;
      const phone = request.customerPhone || '';
      const whatsapp = kind === 'repair_requests' ? request.customerWhatsapp || '' : request.whatsappNumber || '';
      const address = kind === 'orders' ? request.deliveryAddress || '' : kind === 'repair_requests' ? request.customerAddress || '' : request.locationAddress || '';
      const pincode = kind === 'repair_requests' ? request.customerPincode || '' : request.pincode || '';
      const payload = kind === 'repair_requests'
        ? { customerAddress: address, customerPhone: phone, customerWhatsapp: whatsapp, customerPincode: pincode, updatedAt: new Date() }
        : kind === 'orders'
          ? { deliveryAddress: address, customerPhone: phone, whatsappNumber: whatsapp, landmark: request.landmark || '', pincode, updatedAt: new Date() }
          : { locationAddress: address, customerPhone: phone, whatsappNumber: whatsapp, landmark: request.landmark || '', pincode, updatedAt: new Date() };
      await updateDoc(doc(db, kind, request.id), payload);
      setEditing(null);
    } catch (issue) { console.error('Could not update request', issue); setError('The request could not be updated. Please try again.'); }
    finally { setSaving(false); }
  };

  const title = (item: Request, kind: Kind) => kind === 'repair_requests'
    ? `${item.brand || ''} ${item.model || item.deviceName || 'Device'} repair`.trim()
    : kind === 'orders' ? item.deviceName || 'Device order' : `${item.brand || ''} ${item.deviceName || 'Device sale'}`;
  const subtitle = (item: Request, kind: Kind) => kind === 'repair_requests' ? item.service || 'Repair request' : `₹${Number(kind === 'orders' ? item.price : item.expectedPrice || 0).toLocaleString('en-IN')}`;
  const cards = (items: Request[], kind: Kind) => items.length ? <div className="mt-4 grid gap-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-[#E3D9F9] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-[#1E1B29]">{title(item, kind)}</h3><p className="mt-1 text-sm text-[#6E6683]">Request #{item.id.slice(0, 8)} · {when(item)} · {subtitle(item, kind)}</p></div><span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#92400E]">{(item.status || 'Pending').replaceAll('_', ' ')}</span></div><div className="mt-4 flex flex-wrap gap-3"><Link href={kind === 'orders' ? `/track-purchase?order=${item.id}` : `/track?order=${item.id}`} className="rounded-lg border border-[#D8C8F6] px-3 py-2 text-sm font-bold text-[#5B21B6]">View details</Link>{editable(item) && <><button onClick={() => setEditing({ kind, request: { ...item } })} className="rounded-lg border border-[#D8C8F6] px-3 py-2 text-sm font-bold text-[#5B21B6]">Edit request</button><button onClick={() => cancel(kind, item.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Cancel request</button></>}</div></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[#E3D9F9] bg-[#FAF7FF] p-6 text-sm font-semibold text-[#6E6683]">No active {kind === 'repair_requests' ? 'repair' : kind === 'orders' ? 'order' : 'sell'} requests.</div>;

  if (loading) return <main className="grid min-h-[60vh] place-items-center text-[#5B21B6]"><span className="animate-pulse font-bold">Loading your profile…</span></main>;
  if (!user) return <main className="mx-auto my-16 max-w-md rounded-3xl border border-[#E3D9F9] bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F3ECFF] text-xl">G</div><h1 className="mt-4 text-2xl font-black text-[#1E1B29]">Your Profile</h1><p className="mt-2 text-[#6E6683]">Sign in to manage your sell, order, and repair requests.</p><button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="mt-6 rounded-xl bg-[#5B21B6] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#6D28D9]">Continue with Google</button></main>;

  const repairEdit = editing?.kind === 'repair_requests';
  const editAddress = editing?.kind === 'orders' ? editing.request.deliveryAddress : repairEdit ? editing?.request.customerAddress : editing?.request.locationAddress;
  const editWhatsapp = repairEdit ? editing?.request.customerWhatsapp : editing?.request.whatsappNumber;
  const editPincode = repairEdit ? editing?.request.customerPincode : editing?.request.pincode;
  const updateEdited = (changes: Partial<Request>) => setEditing((current) => current && { ...current, request: { ...current.request, ...changes } });

  return <main className="mx-auto max-w-5xl px-4 py-10"><header className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#5B21B6] font-black text-white">{user.displayName?.slice(0, 1).toUpperCase() || 'U'}</div><div><h1 className="text-2xl font-black text-[#1E1B29]">Your Profile</h1><p className="text-sm text-[#6E6683]">{user.email}</p></div></div><button onClick={() => signOut(auth)} className="rounded-xl border border-[#E3D9F9] px-4 py-2 font-bold text-[#5B21B6]">Sign out</button></header>{error && <p className="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}<section className="mt-8 rounded-3xl border border-[#E3D9F9] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wide text-[#7C3AED]">Contact & pickup details</p><h2 className="mt-2 text-xl font-black text-[#1E1B29]">{user.displayName || 'Your profile'}</h2><p className="mt-1 text-[#6E6683]">{primaryAddress}</p></div><Link href="/profile/edit" className="rounded-xl px-4 py-3 font-bold shadow-sm transition hover:brightness-110" style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}>Edit Profile</Link></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2"><Link href="/profile/cancelled" className="inline-flex items-center gap-2 font-bold text-[#5B21B6]">Cancelled History ({cancelledCount}) <span aria-hidden>→</span></Link><Link href="/profile/completed" className="inline-flex items-center gap-2 font-bold text-[#5B21B6]">Successful History <span aria-hidden>→</span></Link></div></section><section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Repair Requests</h2>{cards(activeRepairs, 'repair_requests')}</section><section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Sell Requests</h2>{cards(activeSells, 'sell_requests')}</section><section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Order Requests</h2>{cards(activeOrders, 'orders')}</section>{editing && <div className="fixed inset-0 z-50 grid place-items-center bg-[#1E1B29]/40 p-4"><form onSubmit={saveAddress} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"><h2 className="text-xl font-black text-[#1E1B29]">Edit request details</h2><p className="mt-1 text-sm text-[#6E6683]">Your repair or delivery contact details will be updated.</p><div className="mt-5 grid gap-3"><input required value={editing.request.customerPhone || ''} onChange={(event) => updateEdited({ customerPhone: event.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Phone number" /><input required value={editWhatsapp || ''} onChange={(event) => updateEdited(repairEdit ? { customerWhatsapp: event.target.value } : { whatsappNumber: event.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="WhatsApp number" /><textarea required value={editAddress || ''} onChange={(event) => updateEdited(editing.kind === 'orders' ? { deliveryAddress: event.target.value } : repairEdit ? { customerAddress: event.target.value } : { locationAddress: event.target.value })} className="min-h-24 rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Full address" />{!repairEdit && <input value={editing.request.landmark || ''} onChange={(event) => updateEdited({ landmark: event.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Landmark" />}<input value={editPincode || ''} onChange={(event) => updateEdited(repairEdit ? { customerPincode: event.target.value } : { pincode: event.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Pincode" /></div><div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white">{saving ? 'Saving…' : 'Save changes'}</button><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-[#E3D9F9] px-4 py-3 font-bold text-[#5B21B6]">Cancel</button></div></form></div>}</main>;
}
