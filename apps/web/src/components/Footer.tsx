import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-grid">
      <div><Link href="/" className="site-logo"><span className="brand-mark"><Image src="https://ik.imagekit.io/e8vtmc5nh/Picsart_26-07-30_18-01-53-939.png" alt="Selltronics" width={34} height={34} className="w-full h-full object-contain" /></span> Selltronics</Link><p>India&apos;s simple, secure way to give technology a second life.</p></div>
      <div><h4>Marketplace</h4><Link href="/sell">Sell a device</Link><Link href="/shop">Shop Pre-Owned</Link><Link href="/track-purchase">Track purchase</Link></div>
      <div><h4>Support</h4><Link href="/track">Track sell request</Link><Link href="/#faq">Help centre</Link><Link href="/#why">Why Selltronics</Link></div>
      <div><h4>Company</h4><Link href="/#about">About us</Link></div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} Selltronics. All rights reserved.</span>
      <span className="footer-powered">Powered by <a href="https://www.asteroic.com/" target="_blank" rel="noreferrer">
        <Image src="https://ik.imagekit.io/e8vtmc5nh/Picsart_26-07-02_11-34-44-246.png?updatedAt=1782972404250" alt="Asteroic logo" width={22} height={22} className="rounded" />
        <span className="footer-powered-brand">asteroic</span>
      </a></span>
      <span className="footer-bottom-spacer" aria-hidden="true" />
    </div>
  </footer>;
}
