import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection('products').where('status', '==', 'Available').get();
    const products = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Could not load public products', error);
    return NextResponse.json({ error: 'Unable to load products.' }, { status: 500 });
  }
}
