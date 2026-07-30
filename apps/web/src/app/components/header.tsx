"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/92 backdrop-blur-md border-b border-[#EFE9FB]">
        <div className="max-w-[1180px] mx-auto flex items-center justify-between px-6 py-3.5">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-space font-bold text-[1.35rem] text-[#1E1B29]">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#7C3AED] to-[#1B0F33] flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            SellTronics
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex gap-8 text-[0.94rem] font-medium text-[#1E1B29]">
            <Link href="#devices" className="hover:text-[#7C3AED] transition-colors">Sell a Device</Link>
            <Link href="#how" className="hover:text-[#7C3AED] transition-colors">How it Works</Link>
            <Link href="#why" className="hover:text-[#7C3AED] transition-colors">Why Us</Link>
            <Link href="#about" className="hover:text-[#7C3AED] transition-colors">About</Link>
          </nav>

          {/* CTA & Burger Menu */}
          <div className="flex items-center gap-3.5">
            <Link href="#devices" className="hidden sm:block bg-[#5B21B6] text-white px-5 py-2.5 rounded-full font-semibold text-[0.9rem] shadow-[0_6px_18px_rgba(91,33,182,0.28)] hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(91,33,182,0.35)] transition-all">
              Get Instant Quote
            </Link>
            
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-[42px] h-[42px] rounded-full border-[1.5px] border-[#E3D9F9] flex flex-col items-center justify-center gap-1 hover:bg-[#F3ECFF] hover:border-transparent transition-all cursor-pointer shrink-0 ml-3.5"
              aria-label="Open menu"
            >
              <span className="w-[18px] h-[2px] bg-[#1E1B29] rounded-[2px]"></span>
              <span className="w-[18px] h-[2px] bg-[#1E1B29] rounded-[2px]"></span>
              <span className="w-[18px] h-[2px] bg-[#1E1B29] rounded-[2px]"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-[#1B0F33]/45 z-[80] transition-opacity duration-250 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Side Drawer Menu */}
      <aside 
        className={`fixed top-0 right-0 h-full w-[min(400px,92vw)] bg-white z-[81] shadow-[-16px_0_40px_rgba(27,15,51,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-y-auto px-5.5 py-6 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-5.5">
          <h3 className="text-[1.3rem] text-[#1E1B29] font-space font-bold">Menu</h3>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="w-[38px] h-[38px] rounded-full border-[1.5px] border-[#E3D9F9] flex items-center justify-center hover:bg-[#F3ECFF] transition-colors cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18"/><path d="M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        {/* User Card */}
        <div className="bg-[#FAF7FF] border border-[#F0EAFB] rounded-[18px] p-5 flex gap-4 items-center mb-5.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#1B0F33] text-white flex items-center justify-center font-space font-bold text-[1.1rem] shrink-0">
            G
          </div>
          <div>
            <b className="block text-[1.05rem] text-[#1E1B29] font-space font-bold">Guest</b>
            <div className="text-[0.84rem] text-[#6E6683] mt-0.5">Not logged in</div>
            <button className="flex items-center gap-1.5 mt-2 text-[0.84rem] font-semibold text-[#7C3AED] hover:underline cursor-pointer bg-transparent border-none p-0 font-inter" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Log In <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>

        {/* Quick Menu (Visual Skeleton matching your design) */}
        <div className="border border-[#EFE9FB] rounded-[18px] overflow-hidden mb-5">
          <div className="flex items-center gap-3.5 p-4 border-b border-[#F2EDFB] hover:bg-[#FAF7FF] transition-colors cursor-pointer">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#F3ECFF] flex items-center justify-center text-[#7C3AED] shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-[19px] h-[19px]"><path d="M6 2h9l3 3v17a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
            </div>
            <div className="flex-1 text-[0.96rem] font-medium text-[#1E1B29]">Track Order</div>
            <div className="text-[#6E6683]">›</div>
          </div>
        </div>
      </aside>
    </>
  );
}