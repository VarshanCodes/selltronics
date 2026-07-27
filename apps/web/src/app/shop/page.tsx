'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Product { id: string; category: string; brand: string; deviceName: string; storage?: string; specs?: string; price: number; deviceImageCode?: string | null; }

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [category, setCategory] = useState('All'); const [search, setSearch] = useState('');
  useEffect(() => { (async () => { try { const result = await getDocs(query(collection(db, 'products'), where('status', '==', 'Available'))); setProducts(result.docs.map((item) => ({ id: item.id, ...item.data() } as Product))); } catch { setProducts([]); } finally { setLoading(false); } })(); }, []);
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  const visible = useMemo(() => products.filter((product) => (category === 'All' || product.category === category) && `${product.brand} ${product.deviceName}`.toLowerCase().includes(search.toLowerCase())), [products, category, search]);
  return <div className="shop-page"><section className="shop-hero"><span className="eyebrow"><i /> Carefully selected inventory</span><h1>Refurbished tech, <em>ready for what&apos;s next.</em></h1><p>Browse devices that are listed by the Selltronics team with transparent details and cash-on-delivery checkout.</p></section><section className="shop-content"><div className="shop-tools"><div className="shop-filters">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><input aria-label="Search devices" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search devices or brands" /></div>{loading ? <div className="shop-empty">Loading available devices…</div> : visible.length ? <div className="shop-grid">{visible.map((product) => <Link href={`/shop/${product.id}`} className="product-card" key={product.id}><div className="product-image">{product.deviceImageCode ? <img src={product.deviceImageCode} alt={product.deviceName} /> : <span>⌁</span>}<b>Ready to ship</b></div><div className="product-info"><small>{product.brand} · {product.category}</small><h2>{product.deviceName}</h2><p>{product.storage || product.specs || 'Expert checked refurbished device'}</p><div><strong>₹{Number(product.price || 0).toLocaleString('en-IN')}</strong><span>View device →</span></div></div></Link>)}</div> : <div className="shop-empty"><h2>No matching devices yet.</h2><p>Try another category, or check back when new items are approved for the shop.</p><Link className="btn-primary" href="/sell">Sell a device</Link></div>}</section></div>;
}
