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
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden pointer-events-none">
      <nav aria-label="Mobile navigation" className="pointer-events-auto mx-auto flex max-w-md items-end justify-between rounded-2xl border border-[#E9E0F8] bg-white/95 px-1.5 py-1.5 shadow-[0_10px_30px_rgba(49,24,92,0.16)] backdrop-blur-xl">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex min-w-[58px] flex-col items-center justify-center -mt-7 transition-transform duration-200 active:scale-95"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4C1D95] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_8px_18px_rgba(91,33,182,0.35)] transition-all duration-200 ${active ? 'ring-4 ring-[#EDE9FE] -translate-y-0.5' : ''}`}>
                  {item.icon(active)}
                </div>
                <span className={`text-[0.66rem] font-bold mt-1 ${active ? 'text-[#5B21B6]' : 'text-[#6E6683]'}`}>
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
              className={`relative min-w-[58px] flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-2 transition-all duration-200 active:scale-95 ${
                active ? 'bg-[#F3ECFF] text-[#5B21B6] font-bold' : 'text-[#6E6683]'
              }`}
            >
              {item.icon(active)}
              <span className="text-[0.68rem] font-semibold leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
