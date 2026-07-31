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
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden pointer-events-none">
      <nav aria-label="Mobile navigation" className="pointer-events-auto mx-auto flex max-w-sm items-end justify-around rounded-full border border-white/60 bg-white/80 px-2 py-1.5 shadow-[0_12px_40px_rgba(49,24,92,0.18)] backdrop-blur-xl">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex min-w-[58px] flex-col items-center justify-center -mt-8 transition-transform duration-300 active:scale-90"
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(91,33,182,0.4)] transition-all duration-300 ${active ? 'ring-4 ring-[#EDE9FE] -translate-y-1' : 'hover:scale-105'}`}>
                  {item.icon(active)}
                </div>
                <span className={`text-[0.66rem] font-bold mt-1 transition-colors duration-200 ${active ? 'text-[#5B21B6]' : 'text-[#6E6683]'}`}>
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
              className={`relative min-w-[58px] flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 transition-all duration-300 active:scale-90 ${
                active ? 'text-[#5B21B6] font-bold' : 'text-[#6E6683]'
              }`}
            >
              <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
                {item.icon(active)}
              </div>
              <span className="text-[0.66rem] font-bold leading-none mt-0.5">
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#5B21B6] animate-ping" style={{ animationDuration: '2s' }} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
