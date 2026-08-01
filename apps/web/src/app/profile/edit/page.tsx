'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, updateProfile, type User } from 'firebase/auth';
import { auth, db } from '@/config/firebase';

type Details = { name: string; phone: string; whatsappNumber: string; address: string; pincode: string; landmark: string };
const empty: Details = { name: '', phone: '', whatsappNumber: '', address: '', pincode: '', landmark: '' };

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [details, setDetails] = useState<Details>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => { const data = snapshot.data(); setDetails({ name: data?.name || user.displayName || '', phone: data?.phone || '', whatsappNumber: data?.whatsappNumber || '', address: data?.address || '', pincode: data?.pincode || '', landmark: data?.landmark || '' }); setLoading(false); }, () => setLoading(false));
  }, [user]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!user) return; setSaving(true); setMessage('');
    try {
      if (details.name !== user.displayName) await updateProfile(user, { displayName: details.name });
      await setDoc(doc(db, 'users', user.uid), { ...details, email: user.email || '', updatedAt: serverTimestamp() }, { merge: true });
      const sellUpdate = { userName: details.name, customerPhone: details.phone, whatsappNumber: details.whatsappNumber, locationAddress: details.address, landmark: details.landmark, pincode: details.pincode, updatedAt: serverTimestamp() };
      const orderUpdate = { customerName: details.name, customerPhone: details.phone, whatsappNumber: details.whatsappNumber, deliveryAddress: details.address, landmark: details.landmark, pincode: details.pincode, updatedAt: serverTimestamp() };
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const [sells, orders] = await Promise.all([getDocs(query(collection(db, 'sell_requests'), where('userId', '==', user.uid))), getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid)))]);
      await Promise.all([...sells.docs.map((item) => updateDoc(item.ref, sellUpdate)), ...orders.docs.map((item) => updateDoc(item.ref, orderUpdate))]);
      setMessage('Profile saved. Your requests and the admin dashboard are up to date.');
    } catch (issue) { console.error('Could not save profile', issue); setMessage('We could not save your profile. Please try again.'); }
    finally { setSaving(false); }
  };
  if (loading) return <main className="grid min-h-[60vh] place-items-center text-[#5B21B6]"><span className="animate-pulse font-bold">Loading profile…</span></main>;
  if (!user) return <main className="mx-auto my-16 max-w-md rounded-3xl border border-[#E3D9F9] bg-white p-8 text-center"><h1 className="text-xl font-black">Please sign in first</h1><Link href="/profile" className="mt-4 inline-block font-bold text-[#5B21B6]">Go to Profile</Link></main>;
  return <main className="mx-auto max-w-2xl px-4 py-10"><Link href="/profile" className="font-bold text-[#5B21B6]">← Back to Profile</Link><section className="mt-5 rounded-3xl border border-[#E3D9F9] bg-white p-6 shadow-sm"><h1 className="text-2xl font-black text-[#1E1B29]">Edit Profile</h1><p className="mt-2 text-[#6E6683]">Your saved details are used to pre-fill future sell and order requests.</p>{message && <p className="mt-4 rounded-xl bg-[#F3ECFF] p-3 text-sm font-semibold text-[#5B21B6]">{message}</p>}<form onSubmit={save} className="mt-6 grid gap-4"><label className="field"><span>Full name</span><input required value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} /></label><label className="field"><span>Phone number</span><input required value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} /></label><label className="field"><span>WhatsApp number</span><input required value={details.whatsappNumber} onChange={(event) => setDetails({ ...details, whatsappNumber: event.target.value })} /></label><label className="field"><span>Full address</span><textarea required value={details.address} onChange={(event) => setDetails({ ...details, address: event.target.value })} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="field"><span>Pincode</span><input required value={details.pincode} onChange={(event) => setDetails({ ...details, pincode: event.target.value })} /></label><label className="field"><span>Landmark</span><input value={details.landmark} onChange={(event) => setDetails({ ...details, landmark: event.target.value })} /></label></div><button disabled={saving} className="mt-2 rounded-xl bg-[#5B21B6] px-5 py-3 font-bold text-white transition hover:bg-[#6D28D9]">{saving ? 'Saving…' : 'Save Profile'}</button></form></section></main>;
}
