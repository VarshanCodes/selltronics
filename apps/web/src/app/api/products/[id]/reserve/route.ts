import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Sign in is required.' }, { status: 401 });
  try {
    const db = getAdminDb();
    await getAuth().verifyIdToken(token);
    const { id } = await context.params;
    const reference = db.collection('products').doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists || snapshot.data()?.status !== 'Available') return NextResponse.json({ error: 'This product is no longer available.' }, { status: 409 });
    await reference.update({ status: 'Reserved' });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Could not reserve product', error);
    return NextResponse.json({ error: 'Unable to reserve product.' }, { status: 500 });
  }
}
