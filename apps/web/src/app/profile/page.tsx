'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, updateProfile, type User } from 'firebase/auth';
import { auth, db } from '../../config/firebase';

type Details = { name: string; phone: string; whatsappNumber: string; address: string };
type HistoryItem = {
  id: string; brand?: string; deviceName?: string; expectedPrice?: number; price?: number;
  status?: string; customerPhone?: string; whatsappNumber?: string; locationAddress?: string;
  deliveryAddress?: string; userName?: string; customerName?: string;
};
type EditTarget = { collection: 'sell_requests' | 'orders'; item: HistoryItem } | null;

const blankDetails: Details = { name: '', phone: '', whatsappNumber: '', address: '' };
const cancelled = (item: HistoryItem) => item.status?.toLowerCase() === 'cancelled';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sellRequests, setSellRequests] = useState<HistoryItem[]>([]);
  const [orders, setOrders] = useState<HistoryItem[]>([]);
  const [details, setDetails] = useState<Details>(blankDetails);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) setDetails((current) => ({ ...current, name: current.name || currentUser.displayName || '' }));
    setLoading(false);
  }), []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setHistoryLoading(true);
      setError('');
      try {
        await user.getIdToken();
        const [profile, sells, buys] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(query(collection(db, 'sell_requests'), where('userId', '==', user.uid))),
          getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid))),
        ]);
        if (profile.exists()) {
          const data = profile.data();
          setDetails({ name: data.name || user.displayName || '', phone: data.phone || '', whatsappNumber: data.whatsappNumber || '', address: data.address || '' });
        }
        setSellRequests(sells.docs.map((item) => ({ id: item.id, ...item.data() } as HistoryItem)));
        setOrders(buys.docs.map((item) => ({ id: item.id, ...item.data() } as HistoryItem)));
      } catch (issue) {
        console.error('Could not load profile history:', issue);
        setError('We could not load your history. Please sign out and sign in with the Google account used for the request, then try again.');
      } finally { setHistoryLoading(false); }
    };
    load();
  }, [user]);

  const saveContactDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (details.name && details.name !== user.displayName) await updateProfile(user, { displayName: details.name });
      await setDoc(doc(db, 'users', user.uid), { ...details, email: user.email || '', updatedAt: serverTimestamp() }, { merge: true });
      const updateSell = { userName: details.name, customerPhone: details.phone, whatsappNumber: details.whatsappNumber, locationAddress: details.address, customerEmail: user.email || '', updatedAt: serverTimestamp() };
      const updateOrder = { customerName: details.name, customerPhone: details.phone, whatsappNumber: details.whatsappNumber, deliveryAddress: details.address, customerEmail: user.email || '', updatedAt: serverTimestamp() };
      await Promise.all([...sellRequests.map((item) => updateDoc(doc(db, 'sell_requests', item.id), updateSell)), ...orders.map((item) => updateDoc(doc(db, 'orders', item.id), updateOrder))]);
      setSellRequests((items) => items.map((item) => ({ ...item, ...updateSell })));
      setOrders((items) => items.map((item) => ({ ...item, ...updateOrder })));
      setEditingDetails(false);
    } catch (issue) { console.error('Could not save contact details:', issue); setError('Your contact details could not be saved. Please try again.'); }
    finally { setSaving(false); }
  };

  const saveRequestContact = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editTarget || !user) return;
    setSaving(true);
    try {
      const { collection: collectionName, item } = editTarget;
      const payload = collectionName === 'sell_requests'
        ? { userName: item.userName || details.name, customerPhone: item.customerPhone || '', whatsappNumber: item.whatsappNumber || '', locationAddress: item.locationAddress || '', updatedAt: serverTimestamp() }
        : { customerName: item.customerName || details.name, customerPhone: item.customerPhone || '', whatsappNumber: item.whatsappNumber || '', deliveryAddress: item.deliveryAddress || '', updatedAt: serverTimestamp() };
      await updateDoc(doc(db, collectionName, item.id), payload);
      if (collectionName === 'sell_requests') setSellRequests((items) => items.map((current) => current.id === item.id ? { ...current, ...payload } : current));
      else setOrders((items) => items.map((current) => current.id === item.id ? { ...current, ...payload } : current));
      setEditTarget(null);
    } catch (issue) { console.error('Could not update request contact:', issue); setError('This request could not be updated. Please try again.'); }
    finally { setSaving(false); }
  };

  const cancel = async (collectionName: 'sell_requests' | 'orders', id: string) => {
    if (!window.confirm('Cancel this request? It will be moved to your cancelled history.')) return;
    try {
      await updateDoc(doc(db, collectionName, id), { status: 'Cancelled', cancelledAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const update = (items: HistoryItem[]) => items.map((item) => item.id === id ? { ...item, status: 'Cancelled' } : item);
      collectionName === 'sell_requests' ? setSellRequests(update) : setOrders(update);
    } catch (issue) { console.error('Could not cancel request:', issue); setError('This request could not be cancelled. Please try again.'); }
  };

  if (loading) return <main className="grid min-h-[60vh] place-items-center text-[#5B21B6] font-bold">Loading profile…</main>;
  if (!user) return <main className="mx-auto my-16 max-w-md rounded-3xl border border-[#E3D9F9] bg-white p-8 text-center"><h1 className="text-2xl font-black text-[#1E1B29]">Your Profile</h1><p className="mt-3 text-[#6E6683]">Sign in to view and manage your order requests.</p><button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="mt-6 rounded-xl bg-[#5B21B6] px-5 py-3 font-bold text-white">Continue with Google</button></main>;

  const activeSells = sellRequests.filter((item) => !cancelled(item));
  const activeOrders = orders.filter((item) => !cancelled(item));
  const totalCancelled = sellRequests.length + orders.length - activeSells.length - activeOrders.length;
  const card = (item: HistoryItem, collectionName: 'sell_requests' | 'orders') => <article key={item.id} className="rounded-2xl border border-[#EFE9FB] bg-[#FAF7FF] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-[#1E1B29]">{collectionName === 'sell_requests' ? `${item.brand || ''} ${item.deviceName || 'Device sale'}` : item.deviceName || 'Device order'}</h3><p className="mt-1 text-sm text-[#6E6683]">{collectionName === 'sell_requests' ? `Expected ₹${Number(item.expectedPrice || 0).toLocaleString('en-IN')}` : `Order request ₹${Number(item.price || 0).toLocaleString('en-IN')}`}</p></div><span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#92400E]">{(item.status || 'Pending').replaceAll('_', ' ')}</span></div><p className="mt-3 text-sm text-[#6E6683]">{collectionName === 'sell_requests' ? item.locationAddress || 'Pickup address not added' : item.deliveryAddress || 'Delivery address not added'}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => setEditTarget({ collection: collectionName, item: { ...item } })} className="rounded-lg border border-[#D8C8F6] px-3 py-2 text-sm font-bold text-[#5B21B6]">Edit contact & address</button><button type="button" onClick={() => cancel(collectionName, item.id)} className="rounded-lg border border-[#FECACA] px-3 py-2 text-sm font-bold text-[#B91C1C]">Cancel {collectionName === 'sell_requests' ? 'sell' : 'order'} request</button></div></article>;

  return <main className="mx-auto max-w-5xl px-4 py-10"><header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-black text-[#1E1B29]">Your Profile</h1><p className="mt-1 text-[#6E6683]">{user.email}</p></div><button onClick={() => signOut(auth)} className="rounded-xl border border-[#E3D9F9] px-4 py-2 font-bold text-[#5B21B6]">Sign out</button></header>{error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</p>}<section className="mt-8 rounded-3xl border border-[#E3D9F9] bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wide text-[#7C3AED]">Contact & location</p><h2 className="mt-1 text-xl font-black text-[#1E1B29]">{details.name || user.displayName || 'Your details'}</h2><p className="mt-2 text-[#6E6683]">{details.address || 'No address saved yet'}</p></div><button onClick={() => setEditingDetails(true)} className="rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white">Change name & location</button></div><Link href="/profile/cancelled" className="mt-5 inline-flex items-center gap-2 font-bold text-[#5B21B6]">Cancelled sell & order requests ({totalCancelled}) <span aria-hidden>→</span></Link></section><section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Sell requests</h2>{historyLoading ? <p className="mt-3 text-[#6E6683]">Loading…</p> : activeSells.length ? <div className="mt-4 grid gap-4">{activeSells.map((item) => card(item, 'sell_requests'))}</div> : <p className="mt-3 rounded-2xl bg-[#FAF7FF] p-5 text-[#6E6683]">No active sell requests.</p>}</section><section className="mt-8"><h2 className="text-xl font-black text-[#1E1B29]">Order requests</h2>{historyLoading ? <p className="mt-3 text-[#6E6683]">Loading…</p> : activeOrders.length ? <div className="mt-4 grid gap-4">{activeOrders.map((item) => card(item, 'orders'))}</div> : <p className="mt-3 rounded-2xl bg-[#FAF7FF] p-5 text-[#6E6683]">No active order requests.</p>}</section>{editingDetails && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><form onSubmit={saveContactDetails} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"><h2 className="text-xl font-black text-[#1E1B29]">Change contact & location</h2><p className="mt-1 text-sm text-[#6E6683]">Updates are also applied to your existing requests and the admin dashboard.</p><div className="mt-5 grid gap-3"><input required value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} placeholder="Name" className="rounded-xl border border-[#E3D9F9] px-4 py-3" /><input required value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} placeholder="Phone number" className="rounded-xl border border-[#E3D9F9] px-4 py-3" /><input required value={details.whatsappNumber} onChange={(event) => setDetails({ ...details, whatsappNumber: event.target.value })} placeholder="WhatsApp number" className="rounded-xl border border-[#E3D9F9] px-4 py-3" /><textarea required value={details.address} onChange={(event) => setDetails({ ...details, address: event.target.value })} placeholder="Full address" className="min-h-24 rounded-xl border border-[#E3D9F9] px-4 py-3" /></div><div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white">{saving ? 'Saving…' : 'Save changes'}</button><button type="button" onClick={() => setEditingDetails(false)} className="rounded-xl border border-[#E3D9F9] px-4 py-3 font-bold text-[#5B21B6]">Cancel</button></div></form></div>}{editTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><form onSubmit={saveRequestContact} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"><h2 className="text-xl font-black text-[#1E1B29]">Edit request contact</h2><p className="mt-1 text-sm text-[#6E6683]">These changes are immediately visible to the admin team.</p><div className="mt-5 grid gap-3"><input required value={editTarget.collection === 'sell_requests' ? editTarget.item.userName || '' : editTarget.item.customerName || ''} onChange={(event) => setEditTarget((current) => current && { ...current, item: { ...current.item, [current.collection === 'sell_requests' ? 'userName' : 'customerName']: event.target.value } })} placeholder="Name" className="rounded-xl border border-[#E3D9F9] px-4 py-3" /><input required value={editTarget.item.customerPhone || ''} onChange={(event) => setEditTarget((current) => current && { ...current, item: { ...current.item, customerPhone: event.target.value } })} placeholder="Phone number" className="rounded-xl border border-[#E3D9F9] px-4 py-3" /><input value={editTarget.item.whatsappNumber || ''} onChange={(event) => setEditTarget((current) => current && { ...current, item: { ...current.item, whatsappNumber: event.target.value } })} placeholder="WhatsApp number" className="rounded-xl border border-[#E3D9F9] px-4 py-3" /><textarea required value={editTarget.collection === 'sell_requests' ? editTarget.item.locationAddress || '' : editTarget.item.deliveryAddress || ''} onChange={(event) => setEditTarget((current) => current && { ...current, item: { ...current.item, [current.collection === 'sell_requests' ? 'locationAddress' : 'deliveryAddress']: event.target.value } })} placeholder="Full address" className="min-h-24 rounded-xl border border-[#E3D9F9] px-4 py-3" /></div><div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-[#5B21B6] px-4 py-3 font-bold text-white">{saving ? 'Saving…' : 'Save request'}</button><button type="button" onClick={() => setEditTarget(null)} className="rounded-xl border border-[#E3D9F9] px-4 py-3 font-bold text-[#5B21B6]">Cancel</button></div></form></div>}</main>;
}
