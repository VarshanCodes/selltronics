const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function signature(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'selltronics-admin-session-v1';
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

export async function createAdminSession() {
  const value = String(Date.now());
  return `${value}.${await signature(value)}`;
}

export async function verifyAdminSession(token?: string) {
  if (!token) return false;
  const [value, received] = token.split('.');
  if (!value || !received || Date.now() - Number(value) > 1000 * 60 * 60 * 8) return false;
  return received === await signature(value);
}
