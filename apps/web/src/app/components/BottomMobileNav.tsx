'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomMobileNav() {
  const pathname = usePathname();

  const items = [
    {
      label: 'Home',
      href: '/',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'} width="22" height="22">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      ),
    },
    {
      label: 'Shop',
      href: '/shop',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'} width="22" height="22">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
          <path d="M3 6h18" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Sell',
      href: '/sell',
      isHighlight: true,
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'} width="22" height="22">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#EFE9FB] shadow-[0_-4px_20px_rgba(27,15,51,0.08)] sm:hidden">
      <nav className="flex items-center justify-around py-1.5 px-2">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-[#5B21B6] to-[#7C3AED] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(91,33,182,0.4)] transition-transform hover:scale-105 ${active ? 'ring-4 ring-[#E3D9F9]' : ''}`}>
                  {item.icon(active)}
                </div>
                <span className={`text-[0.7rem] font-bold mt-0.5 ${active ? 'text-[#5B21B6]' : 'text-[#6E6683]'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                active ? 'text-[#5B21B6] font-bold' : 'text-[#6E6683] hover:text-[#1E1B29]'
              }`}
            >
              {item.icon(active)}
              <span className="text-[0.72rem] font-semibold mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
