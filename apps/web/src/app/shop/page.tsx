'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Product { id: string; category: string; brand: string; deviceName: string; storage?: string; specs?: string; price: number; originalPrice?: number; deviceImageCode?: string | null; createdAt?: any; status?: string; }

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [category, setCategory] = useState('All'); const [search, setSearch] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        // Filter by Available status client-side
        const available = productsList.filter((p) => p.status === 'Available');
        
        // Sort by createdAt descending client-side
        available.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        
        setProducts(available);
      } catch (error) {
        console.error('Error fetching products from Firestore:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  const visible = useMemo(() => products.filter((product) => (category === 'All' || product.category === category) && `${product.brand} ${product.deviceName}`.toLowerCase().includes(search.toLowerCase())), [products, category, search]);
  return <div className="shop-page"><section className="shop-hero"><span className="eyebrow"><i /> Carefully selected inventory</span><h1>Pre-Owned tech, <em>ready for what&apos;s next.</em></h1><p>Browse devices that are listed by the Selltronics team with transparent details and a simple order-request flow.</p></section><section className="shop-content"><div className="shop-tools"><div className="shop-filters">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><input aria-label="Search devices" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search devices or brands" /></div>{loading ? <div className="shop-empty">Loading available devices…</div> : visible.length ? <div className="shop-grid">{visible.map((product) => <Link href={`/shop/${product.id}`} className="product-card" key={product.id}><div className="product-image">{product.deviceImageCode ? <img src={product.deviceImageCode} alt={product.deviceName} /> : <span>⌁</span>}<b>Ready to ship</b></div><div className="product-info"><small>{product.brand} · {product.category}</small><h2>{product.deviceName}</h2><p>{product.storage || product.specs || 'Expert checked Pre-Owned device'}</p><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}><div className="flex flex-col"><strong className="text-xl font-bold text-[#1E1B29]">₹{Number(product.price || 0).toLocaleString('en-IN')}</strong>{product.originalPrice ? (<span className="text-[0.75rem] text-red-500 line-through">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>) : null}</div><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>View device <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span></div></div></Link>)}</div> : <div className="shop-empty"><h2>No matching devices yet.</h2><p>New devices are added regularly. Check back soon!</p><Link className="btn-primary" href="/sell" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Sell a device <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></Link></div>}</section></div>;
}
