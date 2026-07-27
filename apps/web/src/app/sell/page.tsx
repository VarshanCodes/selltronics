import SellDeviceForm from '../../components/SellDeviceForm';
import { Suspense } from 'react';

export default function SellPage() {
  return <div className="sell-page-shell"><section className="sell-page-intro"><span className="eyebrow">Get a no-pressure quote</span><h1>Turn your old tech into <em>new possibilities.</em></h1><p>Choose your device, share its condition, and book a secure doorstep pickup.</p><div className="sell-benefits"><span>All major brands</span><span>Free doorstep pickup</span><span>Secure data wipe</span></div></section><Suspense fallback={<div className="admin-loading">Loading sell form...</div>}><SellDeviceForm /></Suspense></div>;
}
