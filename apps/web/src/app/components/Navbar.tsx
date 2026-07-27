'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../../config/firebase';

const links = [
  { label: 'Sell a device', href: '/sell' },
  { label: 'Shop devices', href: '/shop' },
  { label: 'Track order', href: '/track-purchase' },
  { label: 'Why Selltronics', href: '/#why' },
];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8"/><path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>;
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const drawerId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const isActive = (href: string) => href !== '/#why' && pathname === href;
  const close = () => setOpen(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  const logout = async () => {
    await signOut(auth);
    close();
  };

  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    document.body.classList.add('menu-open');
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const items = drawerRef.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', onKeyDown);
      opener?.focus();
    };
  }, [open]);

  const menu = open && typeof document !== 'undefined'
    ? createPortal(
      <div className="site-menu-layer" role="presentation">
        <button className="site-menu-overlay" type="button" onClick={close} aria-label="Close navigation menu" />
        <aside ref={drawerRef} id={drawerId} className="site-drawer" aria-label="Navigation menu" aria-modal="true" role="dialog">
          <div className="drawer-head"><span className="site-logo"><BrandMark /> <span>Selltronics</span></span><button ref={closeRef} type="button" onClick={close} aria-label="Close navigation menu"><CloseIcon /></button></div>
        <div className="drawer-account">
          <span>{user?.displayName?.slice(0, 1).toUpperCase() || 'G'}</span>
          <div><b>{user?.displayName || 'Guest'}</b><small>{user?.email || 'Sign in during checkout to save your details.'}</small></div>
        </div>
        <p className="drawer-intro">Everything you need to buy, sell, and track your device.</p>
        <nav aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={link.href} onClick={close} aria-current={isActive(link.href) ? 'page' : undefined}><span>{link.label}</span><ChevronIcon /></Link>)}</nav>
        <Link href="/sell" className="drawer-cta" onClick={close}>Get an instant quote</Link>
        {user && <button type="button" className="drawer-logout" onClick={logout}>Log out</button>}
        </aside>
      </div>,
      document.body,
    )
    : null;

  return <>
    <header className="site-nav">
      <div className="site-nav-inner">
      <Link href="/" className="site-logo"><BrandMark /> <span>Selltronics</span></Link>
      <nav className="site-nav-links" aria-label="Primary navigation">
        {links.map((link) => <Link key={link.href} href={link.href} className={isActive(link.href) ? 'active' : ''} aria-current={isActive(link.href) ? 'page' : undefined}>{link.label}</Link>)}
      </nav>
      <div className="site-nav-actions">
        <Link href="/sell" className="site-nav-cta">Get instant quote</Link>
        <button ref={openerRef} className="site-menu-button" type="button" onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls={drawerId}><span /><span /><span /></button>
      </div>
      </div>
    </header>
    {menu}
  </>;
}
