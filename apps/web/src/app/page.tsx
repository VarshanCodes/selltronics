/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import HomeFeaturedProducts from '@/components/HomeFeaturedProducts';

const categories = [
  { name: 'Smartphones', sub: 'Apple, Samsung, OnePlus & more', image: 'https://ik.imagekit.io/e8vtmc5nh/Picsart_26-07-30_21-18-32-076.png', category: 'Smartphones' },
  { name: 'Laptops', sub: 'Dell, HP, Lenovo, ASUS & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_000000003aa481fa8a4ae4415b099d49.png', category: 'Laptops' },
  { name: 'Tablets', sub: 'iPad, Galaxy Tab, Xiaomi & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_00000000bfcc820b9ec8f0cc9e0379d8.png', category: 'Tablets' },
  { name: 'Mac devices', sub: 'MacBook, iMac, Mac mini & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_0000000026b8820b9d8f884d7d0d3bf5.png', category: 'Mac' },
  { name: 'Other devices', sub: 'Watches, consoles & accessories', image: 'https://ik.imagekit.io/e8vtmc5nh/file_00000000ae90820ba15f7b2a65f2ca9c.png', category: 'Other devices' },
];

const brands = [
  ['Apple', 'apple'], ['Samsung', 'samsung'], ['Google', 'google'], ['OnePlus', 'oneplus'], ['Xiaomi', 'xiaomi'],
  ['Dell', 'dell'], ['HP', 'hp'], ['Lenovo', 'lenovo'], ['ASUS', 'asus'], ['Acer', 'acer'],
];

function DeviceIcon({ type }: { type: string }) {
  if (type === 'laptop') return <svg viewBox="0 0 90 90" fill="none"><rect x="22" y="22" width="46" height="33" rx="4" stroke="currentColor" strokeWidth="3"/><path d="M13 63h64l-5 5H18l-5-5Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg>;
  if (type === 'tablet') return <svg viewBox="0 0 90 90" fill="none"><rect x="25" y="14" width="40" height="62" rx="5" stroke="currentColor" strokeWidth="3"/><path d="M42 68h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
  if (type === 'watch') return <svg viewBox="0 0 90 90" fill="none"><path d="M36 17h18l3 12H33l3-12ZM36 73h18l3-12H33l3 12Z" stroke="currentColor" strokeWidth="3"/><rect x="25" y="27" width="40" height="37" rx="10" stroke="currentColor" strokeWidth="3"/><path d="M45 37v10l7 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 90 90" fill="none"><rect x="28" y="12" width="34" height="65" rx="6" stroke="currentColor" strokeWidth="3"/><path d="M41 68h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
}

function FeatureIcon({ type }: { type: 'quote' | 'pickup' | 'inspect' | 'pay' | 'price' | 'wipe' }) {
  const common = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'quote') return <svg viewBox="0 0 24 24" fill="none"><path {...common} d="M5 4h14v16H5zM8 9h8M8 13h5"/></svg>;
  if (type === 'pickup') return <svg viewBox="0 0 24 24" fill="none"><path {...common} d="M3 7h12v10H3zM15 10h3l3 3v4h-6zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>;
  if (type === 'inspect') return <svg viewBox="0 0 24 24" fill="none"><circle {...common} cx="11" cy="11" r="6"/><path {...common} d="m16 16 4 4M8.5 11l1.7 1.7 3.5-3.5"/></svg>;
  if (type === 'pay') return <svg viewBox="0 0 24 24" fill="none"><rect {...common} x="3" y="6" width="18" height="12" rx="2"/><path {...common} d="M3 10h18M7 14h3"/></svg>;
  if (type === 'price') return <svg viewBox="0 0 24 24" fill="none"><path {...common} d="M4 4h8l8 8-8 8-8 8-8-8zM8 8h.01"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none"><path {...common} d="M6 5h12v14H6zM9 9h6M9 13h6M9 17h4"/><path {...common} d="m16 3 2 2 3-3"/></svg>;
}

export default function HomePage() {
  const steps: Array<[string, string, string, 'quote' | 'pickup' | 'inspect' | 'pay']> = [
    ['01', 'Get your quote', 'Pick your device, answer a few condition questions, and see your price instantly - no store visit needed.', 'quote'],
    ['02', 'Book a pickup', 'Choose a time slot that works for you. Our agent comes to your home or office anywhere in Chennai.', 'pickup'],
    ['03', 'Quick inspection', 'We verify the device against your quote in front of you - takes about 10 minutes, no surprises.', 'inspect'],
    ['04', 'Get paid instantly', 'Once confirmed, payment is sent to your UPI ID on the spot. Your data is wiped securely before we leave.', 'pay'],
  ];
  const reasons: Array<[string, string, 'price' | 'pickup' | 'wipe']> = [
    ['Certified fair pricing', 'Prices are benchmarked daily against the resale market - never a lowball offer at pickup.', 'price'],
    ['Same-day pickup', 'Most pickups happen within a few hours of booking, anywhere across Chennai.', 'pickup'],
    ['Secure data wipe', 'Every device is factory-reset and data-wiped on the spot, before you hand it over.', 'wipe'],
  ];

  return <div className="home-page">
    <div className="top-strip">Get the best value for your old tech - <b>free pickup available.</b></div>
    <section className="home-hero"><div className="home-hero-inner">
      <div className="home-hero-copy reveal-up"><span className="eyebrow">Trusted re-commerce, made simple</span><h1>Make your old tech <em>worth more.</em></h1><p>Sell devices for a fair quote or shop expertly checked Pre-Owned tech. One place, no fuss.</p><div className="hero-actions"><Link href="/sell" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Sell a device <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></Link><Link href="/shop" className="btn-ghost">Shop Pre-Owned</Link></div><div className="hero-trust"><div><b>10k+</b><span>devices given a<br />second life</span></div><div><b>4.8/5</b><span>customer rating</span></div><div><b>Zero</b><span>cost to get a quote</span></div></div></div>
      <div className="hero-visual" aria-hidden="true"><div className="hero-orb"/><div className="quote-preview first"><span>Estimated value</span><b>iPhone 15 Pro</b><strong>Rs. 52,000 <small>up to</small></strong><i><u/></i><p>Excellent condition</p></div><div className="quote-preview second"><span>Estimated value</span><b>MacBook Air M1</b><strong>Rs. 58,000 <small>up to</small></strong><i><u/></i><p>Good condition</p></div><div className="hero-device"><DeviceIcon type="phone"/></div></div>
    </div></section>
    <div className="price-ticker"><div>Today&apos;s top quotes <b>iPhone 15 Pro Rs. 52,000</b> | MacBook Air M1 <b>Rs. 58,000</b> | iPad Air <b>Rs. 31,000</b> | Galaxy S24 <b>Rs. 39,000</b> | OnePlus 11 <b>Rs. 22,000</b></div></div>

    <section id="devices" className="home-section"><div className="section-inner"><div className="section-head"><span>What are you selling?</span><h2>Your device still has value.</h2><p>Choose a category, tell us a little about the device, and get started in minutes.</p></div><div className="device-grid-home">{categories.map((item) => <Link href={`/sell?category=${encodeURIComponent(item.category)}`} className="device-category" key={item.name}><div><h3>{item.name}</h3><p>{item.sub}</p></div><span className="device-arrow" style={{ display: 'grid', placeItems: 'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span><div className="device-drawing"><img src={item.image} alt={item.name} /></div></Link>)}</div></div></section>

    <HomeFeaturedProducts />

    <section className="home-section soft-section"><div className="section-inner"><div className="section-head centered"><span>Brands we work with</span><h2>The tech you know and love.</h2><p>We evaluate popular brands across phones, laptops, tablets, wearables, and more.</p></div><div className="brand-grid">{brands.map(([name, icon]) => <div key={name} className="brand-tile"><img src={`https://cdn.simpleicons.org/${icon}`} alt="" width="24" height="24"/>{name}</div>)}</div></div></section>

    <section id="how" className="home-section"><div className="section-inner"><div className="section-head"><span>Simple, fast, fair</span><h2>How selling with Selltronics works</h2></div><div className="steps-grid">{steps.map(([number, title, text, icon]) => <article className="step-card" key={number}><b>{number}</b><span className="context-icon"><FeatureIcon type={icon}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section id="why" className="home-section dark-section"><div className="section-inner"><div className="section-head"><span>Why Selltronics</span><h2>Built for people who don&apos;t want the hassle</h2></div><div className="why-grid-home">{reasons.map(([title, text, icon]) => <article key={title}><span className="context-icon"><FeatureIcon type={icon}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="home-section reviews-section"><div className="section-inner"><div className="section-head centered"><span>Real customers</span><h2>What Chennai says about us</h2></div><div className="reviews-grid">{[
      ['"Quoted Rs. 27,000 for my iPhone 12 online, got exactly that after inspection. Payment hit my UPI in under a minute."', 'RK', 'Ranjith K.', 'Anna Nagar'],
      ['"Booked a pickup at 6pm, agent arrived by 7:15. No pressure to accept a lower price. Smoothest sale I\'ve done."', 'SP', 'Sandhya P.', 'Velachery'],
      ['"Sold two old laptops in one visit. They explained the condition grading clearly before finalising the price."', 'MJ', 'Mohammed J.', 'Choolaimedu'],
    ].map(([quote, initials, name, area]) => <article className="review-card" key={name}><p>{quote}</p><div><b>{initials}</b><span><strong>{name}</strong><small>{area}</small></span></div></article>)}</div></div></section>

    <section id="faq" className="home-section faq-section"><div className="section-inner"><div className="section-head centered"><span>Frequently asked questions</span><h2>Everything, made clear.</h2></div><div className="faq-list"><details><summary>How do I sell my device?<span>+</span></summary><p>Choose your device, answer the condition questions, add your pickup details, and book a convenient pickup.</p></details><details><summary>What brands and devices do you accept?<span>+</span></summary><p>We accept many phones, laptops, tablets, Macs, watches and other devices from the listed brands, plus supported models under Other.</p></details><details><summary>Can I track my order?<span>+</span></summary><p>Yes. Use the request ID you receive to track purchases and sell requests from the navigation menu.</p></details></div></div></section>
    <section className="home-cta"><h2>Ready to make a move?</h2><p>Get a no-pressure quote for your old device today.</p><Link href="/sell" className="btn-primary">Start selling</Link></section>
  </div>;
}
