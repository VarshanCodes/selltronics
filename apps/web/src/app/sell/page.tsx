'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SellDeviceForm = dynamic(() => import('../../components/SellDeviceForm'), {
  ssr: false,
  loading: () => <div className="admin-loading" style={{ minHeight: '400px', display: 'grid', placeItems: 'center' }}>Loading valuation calculator...</div>,
});

export default function SellPage() {
  return (
    <div className="sell-page-shell">
      <section className="sell-page-intro">
        <span className="eyebrow">Get a no-pressure quote</span>
        <h1>Turn your old tech into <em>new possibilities.</em></h1>
        <p>Choose your device, share its condition, and book a secure doorstep pickup.</p>
        <div className="sell-benefits">
          <span>All major brands</span>
          <span>Free doorstep pickup</span>
          <span>Secure data wipe</span>
        </div>
      </section>
      <Suspense fallback={<div className="admin-loading" style={{ minHeight: '400px', display: 'grid', placeItems: 'center' }}>Loading sell form...</div>}>
        <SellDeviceForm />
      </Suspense>
    </div>
  );
}

