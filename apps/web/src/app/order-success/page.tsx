import { Suspense } from 'react';
import OrderSuccessClient from './OrderSuccessClient';

export default function OrderSuccessPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#FAF7FF]" />}><OrderSuccessClient /></Suspense>;
}
