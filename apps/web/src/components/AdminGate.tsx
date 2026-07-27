'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';

export default function AdminGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch('/api/admin-session').then((response) => response.json()).then(({ authorized }) => setAllowed(Boolean(authorized))).catch(() => setAllowed(false)).finally(() => setReady(true)); }, []);
  const unlock = async (event: FormEvent) => { event.preventDefault(); setSubmitting(true); setError(''); try { const response = await fetch('/api/admin-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); if (!response.ok) { setError('Incorrect password. Please try again.'); return; } setAllowed(true); } finally { setSubmitting(false); } };

  if (!ready) return <main className="admin-gate"><p>Loading secure area...</p></main>;
  if (allowed) return <>{children}</>;
  return (
    <main className="admin-gate">
      <form className="admin-gate-card" onSubmit={unlock}>
        <span>Selltronics</span>
        <h1>Admin access</h1>
        <p>Enter the administrator password to continue.</p>
        <label className="field" style={{ display: 'block', position: 'relative' }}>
          <span>Password</span>
          <div style={{ position: 'relative' }}>
            <input 
              autoFocus 
              required 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              placeholder="Enter password" 
              style={{ paddingRight: '45px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6E6683',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815-3.65L21 21m-3.956-3.956-3.09-3.09m-1.222-1.222a3 3 0 1 1-4.225-4.225m4.225 4.225-3.56-3.56" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>
        {error && <p className="track-error">{error}</p>}
        <button className="btn-primary" disabled={submitting} type="submit">
          {submitting ? 'Checking...' : 'Unlock admin area'}
        </button>
      </form>
    </main>
  );
}

export async function clearAdminAccess() { await fetch('/api/admin-session', { method: 'DELETE' }); }
