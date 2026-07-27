import Link from 'next/link';

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-grid">
      <div><Link href="/" className="site-logo"><span className="brand-mark">S</span> Selltronics</Link><p>India&apos;s simple, secure way to give technology a second life.</p></div>
      <div><h4>Marketplace</h4><Link href="/sell">Sell a device</Link><Link href="/shop">Shop refurbished</Link><Link href="/track-purchase">Track purchase</Link></div>
      <div><h4>Support</h4><Link href="/track">Track sell request</Link><Link href="/#faq">Help centre</Link><Link href="/#why">Why Selltronics</Link></div>
      <div><h4>Company</h4><Link href="/#about">About us</Link></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Selltronics. All rights reserved.</span><span>Built for better tech cycles.</span></div>
  </footer>;
}
