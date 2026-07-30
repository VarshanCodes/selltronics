import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const snapshot = await getAdminDb().collection('products').doc(id).get();
  if (!snapshot.exists || snapshot.data()?.status !== 'Available') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: { id: snapshot.id, ...snapshot.data() } });
}
