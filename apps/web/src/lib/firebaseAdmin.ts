import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
  try {
    const account = JSON.parse(raw);
    if (!account.project_id || !account.client_email || !account.private_key) {
      throw new Error('The service-account JSON is incomplete.');
    }
    return account;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Invalid JSON.';
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON is invalid: ${reason}`);
  }
}

export function getAdminDb() {
  const adminApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount()) });
  return getFirestore(adminApp);
}
