import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
  return JSON.parse(raw);
}

export function getAdminDb() {
  const adminApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount()) });
  return getFirestore(adminApp);
}
