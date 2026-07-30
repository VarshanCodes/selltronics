import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { verifyAdminSession } from '@/lib/adminSession';

export const runtime = 'nodejs';
const COOKIE_NAME = 'selltronics_admin_session';

async function authorized(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!(await authorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const snapshot = await getAdminDb().collection('products').orderBy('createdAt', 'desc').get();
  return NextResponse.json({ products: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) });
}

export async function POST(request: NextRequest) {
  if (!(await authorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const product = await request.json();
  if (!product.deviceName || !Number.isFinite(Number(product.price)) || !Array.isArray(product.deviceImages) || !product.deviceImages.length) return NextResponse.json({ error: 'Invalid product details.' }, { status: 400 });
  const reference = await getAdminDb().collection('products').add({ ...product, price: Number(product.price), status: 'Available', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ id: reference.id }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await authorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...product } = await request.json();
  if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
  await getAdminDb().collection('products').doc(id).update({ ...product, price: Number(product.price), status: 'Available', updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await authorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
  await getAdminDb().collection('products').doc(id).delete();
  return NextResponse.json({ ok: true });
}
