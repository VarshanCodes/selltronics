"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

type Product = { id: string; brand?: string; category?: string; deviceName?: string; storage?: string; specs?: string; price?: number; deviceImageCode?: string | null; createdAt?: any; status?: string; };

export default function HomeFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
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
        
        setProducts(available.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured products from Firestore:', error);
        setProducts([]);
      }
    })();
  }, []);
  if (!products.length) return null;
  return <section className="home-section soft-section"><div className="section-inner"><div className="section-head"><span>Fresh inventory</span><h2>Just added to the shop.</h2><p>Every listing is published by our team and updates here automatically.</p></div><div className="shop-grid home-product-grid">{products.map((product) => <Link href={`/shop/${product.id}`} className="product-card" key={product.id}><div className="product-image">{product.deviceImageCode ? <img src={product.deviceImageCode} alt={product.deviceName || "Pre-Owned device"} /> : <span>⌁</span>}<b>Ready to ship</b></div><div className="product-info"><small>{product.brand} · {product.category}</small><h2>{product.deviceName}</h2><p>{product.storage || product.specs || "Expert checked Pre-Owned device"}</p><div><strong>₹{Number(product.price || 0).toLocaleString("en-IN")}</strong><span>View device →</span></div></div></Link>)}</div><div className="home-featured-action"><Link href="/shop" className="btn-ghost">View all Pre-Owned devices</Link></div></div></section>;
}
