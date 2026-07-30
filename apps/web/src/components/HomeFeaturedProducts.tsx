"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = { id: string; brand?: string; category?: string; deviceName?: string; storage?: string; specs?: string; price?: number; deviceImageCode?: string | null };

export default function HomeFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unavailable')))
      .then(({ products }) => setProducts((products as Product[]).slice(0, 4)))
      .catch(() => setProducts([]));
  }, []);
  if (!products.length) return null;
  return <section className="home-section soft-section"><div className="section-inner"><div className="section-head"><span>Fresh inventory</span><h2>Just added to the shop.</h2><p>Every listing is published by our team and updates here automatically.</p></div><div className="shop-grid home-product-grid">{products.map((product) => <Link href={`/shop/${product.id}`} className="product-card" key={product.id}><div className="product-image">{product.deviceImageCode ? <img src={product.deviceImageCode} alt={product.deviceName || "Pre-Owned device"} /> : <span>⌁</span>}<b>Ready to ship</b></div><div className="product-info"><small>{product.brand} · {product.category}</small><h2>{product.deviceName}</h2><p>{product.storage || product.specs || "Expert checked Pre-Owned device"}</p><div><strong>₹{Number(product.price || 0).toLocaleString("en-IN")}</strong><span>View device →</span></div></div></Link>)}</div><div className="home-featured-action"><Link href="/shop" className="btn-ghost">View all Pre-Owned devices</Link></div></div></section>;
}
