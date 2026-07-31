'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminNav from '@/app/components/AdminNav';
import AdminStats from '@/app/components/AdminStats';
import AdminOrdersTable from '@/app/components/AdminOrdersTable';
import AdminSellRequests from '@/app/components/AdminSellRequests';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import AdminGate from '@/components/AdminGate';

type DashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
};

type Order = {
  id: string;
  totalPrice?: number;
  status?: string;
  [key: string]: unknown;
};

type SellRequest = {
  id: string;
  [key: string]: unknown;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersSnapshot, sellReqSnapshot] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'sell_requests')),
        ]);
        const ordersData = ordersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Order));
        const sellReqData = sellReqSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as SellRequest));

        setOrders(ordersData);
        setSellRequests(sellReqData);
        setStats({
          totalOrders: ordersData.length,
          totalRevenue: ordersData.reduce((sum, order) => sum + Number(order.totalPrice || order.price || 0), 0),
          pendingOrders: ordersData.filter((order) => ['pending', 'Pending Delivery', 'out_for_delivery'].includes(String(order.status))).length,
          completedOrders: ordersData.filter((order) => ['completed', 'delivered'].includes(String(order.status))).length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Buy Orders', count: orders.length },
    { id: 'sell', label: 'Sell Requests', count: sellRequests.length },
  ];

  return (
    <AdminGate>
      <main className="admin-page">
      <AdminNav />
      <div className="admin-shell">
        <section className="admin-hero">
          <div>
            <span className="admin-eyebrow"><i /> Operations centre</span>
            <h1>Good to see you, Admin.</h1>
            <p>Track sales, review device requests, and keep your marketplace moving.</p>
          </div>
          <Link href="/admin/products" className="btn-primary admin-add-product">+ Add product</Link>
        </section>

        <AdminStats stats={stats} loading={loading} />

        <section className="admin-workspace">
          <div className="admin-workspace-head">
            <div>
              <span className="section-kicker">Marketplace activity</span>
              <h2>{activeTab === 'sell' ? 'Incoming sell requests' : activeTab === 'orders' ? 'Customer orders' : 'Recent activity'}</h2>
            </div>
            <span className="admin-live"><i /> Live database</span>
          </div>

          <div className="admin-tabs" role="tablist" aria-label="Dashboard data">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                {tab.label}{typeof tab.count === 'number' && <span>{tab.count}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="admin-loading">Loading your marketplace data…</div>
          ) : activeTab === 'sell' ? (
            <AdminSellRequests requests={sellRequests} />
          ) : (
            <AdminOrdersTable orders={activeTab === 'overview' ? orders.slice(0, 5) : orders} />
          )}
        </section>
      </div>
    </main>
    </AdminGate>
  );
}
