import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, verifyAdminSession } from '@/lib/adminSession';

const COOKIE_NAME = 'selltronics_admin_session';

export async function GET(request: NextRequest) {
  return NextResponse.json({ authorized: await verifyAdminSession(request.cookies.get(COOKIE_NAME)?.value) });
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const trimmed = typeof password === 'string' ? password.trim() : '';
  if (trimmed !== 'Sell@1806') return NextResponse.json({ authorized: false }, { status: 401 });
  const response = NextResponse.json({ authorized: true });
  response.cookies.set(COOKIE_NAME, await createAdminSession(), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 8, path: '/' });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authorized: false });
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'strict', maxAge: 0, path: '/' });
  return response;
}
