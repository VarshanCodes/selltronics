'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { clearAdminAccess } from '@/components/AdminGate';

export default function AdminNav() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clearAdminAccess();
    router.push('/');
  };

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/admin" className="logo">
            <div className="mark"><img src="https://ik.imagekit.io/e8vtmc5nh/Picsart_26-07-30_18-01-53-939.png" alt="Selltronics" /></div>
            Selltronics
          </Link>

          <nav className="links" style={{ display: 'flex', gap: '32px' }}>
            <Link href="/admin" style={{ fontSize: '0.94rem', fontWeight: '500' }}>
              Dashboard
            </Link>
          </nav>

          <button
            className="burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--violet-600), var(--violet-950))',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.95rem',
                transition: 'transform 0.2s ease',
              }}
            >
              A
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  background: '#fff',
                  border: '1px solid #EFE9FB',
                  borderRadius: '12px',
                  boxShadow: '0 8px 20px rgba(27, 15, 51, 0.15)',
                  minWidth: '200px',
                  zIndex: 100,
                }}
              >
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/admin/profile');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    borderBottom: '1px solid #EFE9FB',
                  }}
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    color: '#D1453B',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
