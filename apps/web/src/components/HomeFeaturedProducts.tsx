'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Product = { id: string; brand?: string; category?: string; deviceName?: string; storage?: string; specs?: string; price?: number; originalPrice?: number; deviceImageCode?: string | null; createdAt?: { seconds?: number }; status?: string };
const Arrow = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;

export default function HomeFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { (async () => { try { const snapshot = await getDocs(collection(db, 'products')); setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product).filter((item) => item.status === 'Available').sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 4)); } catch (error) { console.error('Could not load featured products:', error); } })(); }, []);
  if (!products.length) return null;
  return <section className="home-section soft-section"><div className="section-inner"><div className="section-head"><span>Fresh inventory</span><h2>Just added to the shop.</h2><p>Every listing is published by our team and updates here automatically.</p></div><div className="shop-grid home-product-grid">{products.map((product) => <Link href={`/shop/${product.id}`} className="product-card" key={product.id}><div className="product-image">{product.deviceImageCode ? <img src={product.deviceImageCode} alt={product.deviceName || 'Pre-Owned device'} /> : <span>⌁</span>}<b>Ready to ship</b></div><div className="product-info"><small>{product.brand} · {product.category}</small><h2>{product.deviceName}</h2>{product.storage && <span className="product-storage">{product.storage}</span>}<div><div className="flex flex-col"><strong className="offer-price">₹{Number(product.price || 0).toLocaleString('en-IN')}</strong>{product.originalPrice ? <span className="original-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span> : null}</div><span className="view-device">View device <Arrow /></span></div></div></Link>)}</div><div className="home-featured-action"><Link href="/shop" className="btn-ghost">View all Pre-Owned devices</Link></div></div></section>;
}
