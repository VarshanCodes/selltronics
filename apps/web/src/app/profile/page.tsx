'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, updateProfile, type User } from 'firebase/auth';
import { auth, db } from '../../config/firebase';

type SellRequest = {
  id: string;
  brand?: string;
  deviceName?: string;
  expectedPrice?: number;
  status?: string;
  days?: string;
  createdAt?: any;
};

type BuyOrder = {
  id: string;
  deviceName?: string;
  price?: number;
  status?: string;
  days?: string;
  createdAt?: any;
};

type ProfileDetails = { name: string; phone: string; whatsappNumber: string; address: string };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [buyOrders, setBuyOrders] = useState<BuyOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [details, setDetails] = useState<ProfileDetails>({ name: '', phone: '', whatsappNumber: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setDetails((current) => ({ ...current, name: current.name || currentUser.displayName || '' }));
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setSellRequests([]);
    setBuyOrders([]);
  };

  useEffect(() => {
    if (!user) return;

      const fetchHistory = async () => {
        setDataLoading(true);
        setError('');
        try {
          const sellQuery = query(collection(db, 'sell_requests'), where('userId', '==', user.uid));
          const buyQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const [profileResult, sellResult, buyResult] = await Promise.allSettled([
            getDoc(doc(db, 'users', user.uid)),
            getDocs(sellQuery),
            getDocs(buyQuery),
          ]);

          if (profileResult.status === 'fulfilled' && profileResult.value.exists()) {
            const profile = profileResult.value.data();
            setDetails({ name: profile.name || user.displayName || '', phone: profile.phone || '', whatsappNumber: profile.whatsappNumber || '', address: profile.address || '' });
          }

          if (sellResult.status === 'fulfilled') {
          const sellList: SellRequest[] = [];
          sellResult.value.forEach((doc) => {
            sellList.push({ id: doc.id, ...doc.data() } as SellRequest);
          });
          sellList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setSellRequests(sellList);
          }

          if (buyResult.status === 'fulfilled') {
          const buyList: BuyOrder[] = [];
          buyResult.value.forEach((doc) => {
            buyList.push({ id: doc.id, ...doc.data() } as BuyOrder);
          });
          buyList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setBuyOrders(buyList);
          }

          const failures = [profileResult, sellResult, buyResult].filter((result) => result.status === 'rejected');
          if (failures.length) {
            console.error('Some profile data could not be loaded:', failures);
            setError('Your orders could not be loaded because Firestore denied this account request. Sign in with the Google account used for the order; if it still fails, the current Firestore rules must be published to Firebase.');
          }
        } catch (err) {
          console.error("Error fetching history:", err);
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setDataLoading(false);
        }
      };

    fetchHistory();
  }, [user]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      if (details.name && details.name !== user.displayName) await updateProfile(user, { displayName: details.name });
      await setDoc(doc(db, 'users', user.uid), { ...details, email: user.email || '', updatedAt: serverTimestamp() }, { merge: true });
      await Promise.all([
        ...sellRequests.map((request) => updateDoc(doc(db, 'sell_requests', request.id), {
          userName: details.name, customerPhone: details.phone, whatsappNumber: details.whatsappNumber,
          locationAddress: details.address, customerEmail: user.email || '', updatedAt: serverTimestamp(),
        })),
        ...buyOrders.map((order) => updateDoc(doc(db, 'orders', order.id), {
          customerName: details.name, customerPhone: details.phone, whatsappNumber: details.whatsappNumber,
          deliveryAddress: details.address, customerEmail: user.email || '', updatedAt: serverTimestamp(),
        })),
      ]);
    } catch (error) { console.error('Could not save profile', error); }
    finally { setSavingProfile(false); }
  };

  const cancelRequest = async (collectionName: 'sell_requests' | 'orders', id: string) => {
    if (!window.confirm('Cancel this request? It will remain visible as Cancelled so the Selltronics team can review it.')) return;
    try {
      await updateDoc(doc(db, collectionName, id), { status: 'Cancelled', cancelledAt: serverTimestamp(), updatedAt: serverTimestamp() });
      if (collectionName === 'sell_requests') setSellRequests((items) => items.map((item) => item.id === id ? { ...item, status: 'Cancelled' } : item));
      else setBuyOrders((items) => items.map((item) => item.id === id ? { ...item, status: 'Cancelled' } : item));
    } catch (error) { console.error('Could not cancel request', error); }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', fontFamily: 'var(--font-space)' }}>
        <p style={{ fontWeight: 'bold', color: 'var(--violet-700)', animation: 'pulse 1.5s infinite' }}>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', padding: '40px 30px', background: '#fff', border: '1px solid #EFE9FB', borderRadius: '24px', textAlign: 'center', fontFamily: 'var(--font-space)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--lavender-100)', display: 'grid', placeItems: 'center', margin: '0 auto 20px auto', color: 'var(--violet-700)' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E1B29', marginBottom: '10px' }}>Your Profile</h1>
        <p style={{ color: '#6E6683', fontSize: '0.95rem', marginBottom: '30px', lineHeight: '1.5' }}>Sign in with Google to view your device selling request history, shop orders, and delivery/pickup statuses.</p>
        <button
          onClick={handleSignIn}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', cursor: 'pointer', margin: '0 auto' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ fontFamily: 'var(--font-space)', padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Account Info Header */}
      <div style={{ background: '#fff', border: '1px solid #EFE9FB', borderRadius: '24px', padding: '24px 30px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-600), var(--violet-950))', color: '#fff', fontSize: '1.4rem', fontWeight: 800, display: 'grid', placeItems: 'center' }}>
            {user.displayName?.slice(0, 1).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#1E1B29' }}>{user.displayName}</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6E6683', fontSize: '0.88rem' }}>{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="btn-ghost"
          style={{ borderColor: '#E3D9F9', color: 'var(--violet-700)', padding: '10px 20px', borderRadius: '12px' }}
        >
          Sign Out
        </button>
      </div>
      
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', padding: '16px', borderRadius: '16px', marginBottom: '25px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        <section style={{ background: '#fff', border: '1px solid #EFE9FB', borderRadius: '24px', padding: '24px 30px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: '#1E1B29' }}>Contact & pickup details</h2>
          <p style={{ color: '#6E6683', fontSize: '.9rem', marginBottom: '18px' }}>These details are saved for your next sell request or COD order.</p>
          <form onSubmit={saveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
            <input required value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Full name" />
            <input required value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Phone number" />
            <input required value={details.whatsappNumber} onChange={(e) => setDetails({ ...details, whatsappNumber: e.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="WhatsApp number" />
            <input required value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} className="rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Full address" />
            <button className="btn-primary" disabled={savingProfile} type="submit">{savingProfile ? 'Saving…' : 'Save details'}</button>
          </form>
        </section>
        
        {/* Sell Requests Section */}
        <section style={{ background: '#fff', border: '1px solid #EFE9FB', borderRadius: '24px', padding: '24px 30px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: '#1E1B29', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '18px', background: 'var(--violet-700)', borderRadius: '3px' }}></span>
            Your Device Sales History
          </h2>
          
          {dataLoading ? (
            <p style={{ color: '#6E6683', fontSize: '0.9rem' }}>Loading sales history...</p>
          ) : sellRequests.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', background: '#FAF7FF', borderRadius: '16px', border: '1px dashed #E3D9F9' }}>
              <p style={{ color: '#A79CBE', fontWeight: 600, margin: 0 }}>No sell requests submitted yet.</p>
              <Link href="/sell" className="btn-primary" style={{ marginTop: '14px', display: 'inline-block' }}>Sell a device</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sellRequests.map((req) => (
                <div key={req.id} style={{ padding: '20px', border: '1px solid #EFE9FB', borderRadius: '16px', background: '#FAF7FF' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1E1B29' }}>{req.brand} {req.deviceName}</h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: req.status === 'YES CUSTOMER SOLD' || req.status === 'completed' ? '#D1FAE5' : req.status === 'rejected' || req.status === 'CUSTOMER NOT SOLD' ? '#FEE2E2' : '#FEF3C7',
                      color: req.status === 'YES CUSTOMER SOLD' || req.status === 'completed' ? '#065F46' : req.status === 'rejected' || req.status === 'CUSTOMER NOT SOLD' ? '#991B1B' : '#92400E'
                    }}>
                      {(req.status || 'Pending').replaceAll('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#6E6683', gap: '12px' }}>
                    <div>Expected Price: <strong style={{ color: '#1E1B29' }}>₹{Number(req.expectedPrice || 0).toLocaleString('en-IN')}</strong></div>
                    <div>
                      Scheduled Days: <strong style={{ color: 'var(--violet-700)' }}>{req.days ? `${req.days}` : 'Listing in Progress'}</strong>
                    </div>
                  </div>
                  <button type="button" onClick={() => cancelRequest('sell_requests', req.id)} className="btn-ghost" style={{ marginTop: '14px', padding: '7px 12px', borderColor: '#FEE2E2', color: '#991B1B' }}>Cancel sell request</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Purchase Orders Section */}
        <section style={{ background: '#fff', border: '1px solid #EFE9FB', borderRadius: '24px', padding: '24px 30px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: '#1E1B29', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '18px', background: 'var(--violet-700)', borderRadius: '3px' }}></span>
            Your Purchase Orders History
          </h2>
          
          {dataLoading ? (
            <p style={{ color: '#6E6683', fontSize: '0.9rem' }}>Loading purchase history...</p>
          ) : buyOrders.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', background: '#FAF7FF', borderRadius: '16px', border: '1px dashed #E3D9F9' }}>
              <p style={{ color: '#A79CBE', fontWeight: 600, margin: 0 }}>No orders placed yet.</p>
              <Link href="/shop" className="btn-primary" style={{ marginTop: '14px', display: 'inline-block' }}>Browse shop</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {buyOrders.map((order) => (
                <div key={order.id} style={{ padding: '20px', border: '1px solid #EFE9FB', borderRadius: '16px', background: '#FAF7FF' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1E1B29' }}>{order.deviceName}</h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: order.status === 'YES CUSTOMER BUYED' ? '#D1FAE5' : order.status === 'CUSTOMER NOT BUYED' || order.status === 'Cancelled' ? '#FEE2E2' : '#FEF3C7',
                      color: order.status === 'YES CUSTOMER BUYED' ? '#065F46' : order.status === 'CUSTOMER NOT BUYED' || order.status === 'Cancelled' ? '#991B1B' : '#92400E'
                    }}>
                      {order.status || 'Pending Delivery'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#6E6683', gap: '12px' }}>
                    <div>Price: <strong style={{ color: '#1E1B29' }}>₹{Number(order.price || 0).toLocaleString('en-IN')}</strong></div>
                    <div>
                      Delivery Status: <strong style={{ color: 'var(--violet-700)' }}>{order.days ? `${order.days}` : 'Listing in Progress'}</strong>
                    </div>
                  </div>
                  <button type="button" onClick={() => cancelRequest('orders', order.id)} className="btn-ghost" style={{ marginTop: '14px', padding: '7px 12px', borderColor: '#FEE2E2', color: '#991B1B' }}>Cancel COD order</button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
