'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Product {
  id: string; category: string; brand: string; deviceName: string; storage?: string; specs?: string;
  price: number; originalPrice?: number; deviceImageCode?: string | null; createdAt?: { seconds?: number }; status?: string;
}

const ArrowIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product).filter((item) => item.status === 'Available').sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      } catch (error) {
        console.error('Error fetching products from Firestore:', error);
        setProducts([]);
      } finally { setLoading(false); }
    })();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  const visible = useMemo(() => products.filter((product) => (category === 'All' || product.category === category) && `${product.brand} ${product.deviceName}`.toLowerCase().includes(search.toLowerCase())), [products, category, search]);

  return <div className="shop-page"><section className="shop-hero"><span className="eyebrow"><i /> Carefully selected inventory</span><h1>Pre-Owned tech, <em>ready for what&apos;s next.</em></h1><p>Browse devices that are listed by the Selltronics team with transparent details and a simple order-request flow.</p></section><section className="shop-content"><div className="shop-tools"><div className="shop-filters">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><input aria-label="Search devices" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search devices or brands" /></div>{loading ? <div className="shop-empty">Loading available devices…</div> : visible.length ? <div className="shop-grid">{visible.map((product) => <Link href={`/shop/${product.id}`} className="product-card" key={product.id}><div className="product-image">{product.deviceImageCode ? <img src={product.deviceImageCode} alt={product.deviceName} /> : <span>⌁</span>}<b>Ready to ship</b></div><div className="product-info"><small>{product.brand} · {product.category}</small><h2>{product.deviceName}</h2><p>{product.storage || product.specs || 'Expert checked Pre-Owned device'}</p><div><div className="flex flex-col"><strong className="offer-price">₹{Number(product.price || 0).toLocaleString('en-IN')}</strong>{product.originalPrice ? <span className="original-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span> : null}</div><span className="view-device">View device <ArrowIcon /></span></div></div></Link>)}</div> : <div className="shop-empty"><h2>No matching devices yet.</h2><p>New devices are added regularly. Check back soon!</p><Link className="btn-primary" href="/sell">Sell a device <ArrowIcon /></Link></div>}</section></div>;
}
