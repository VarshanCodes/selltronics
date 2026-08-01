"use client";

import { useState } from "react";
import AdminAddProductForm from "@/components/AdminAddProductForm";
import AdminBuyOrders from "@/app/components/AdminBuyOrders";
import AdminSellRequests from "@/app/components/AdminSellRequests";
import AdminNav from "@/app/components/AdminNav";
import AdminGate from "@/components/AdminGate";

type TabType = "orders" | "add" | "sellRequests";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  return (
    <AdminGate>
      <div style={{ background: '#FAF7FF', minHeight: '100vh' }}>
      <AdminNav />
      <div className="admin-container">
        {/* Admin Header */}
        <div className="admin-header" style={{
          background: 'white',
          padding: '20px',
          borderRadius: '20px',
          border: '1px solid #EFE9FB',
          boxShadow: '0 4px 12px rgba(91, 33, 182, 0.08)',
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0' }}>Selltronics Admin</h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.95rem', margin: 0 }}>Manage Inventory, Deliveries & Device Evaluations</p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--lavender-50)',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #E3D9F9',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#10B981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--ink)' }}>System Online</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ borderBottom: '1px solid #EFE9FB', marginBottom: '30px', marginTop: '30px' }}>
          <div style={{ display: 'flex', gap: '30px' }}>
            {[
              { id: 'orders', label: 'Manage Order Requests' },
              { id: 'add', label: 'Publish New Device' },
              { id: 'sellRequests', label: 'Evaluate User Devices' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  padding: '14px 0',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: activeTab === tab.id ? 'var(--violet-700)' : 'var(--gray)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--violet-700)' : 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {activeTab === "orders" && <AdminBuyOrders />}
          {activeTab === "add" && <AdminAddProductForm />}
          {activeTab === "sellRequests" && <AdminSellRequests />}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
    </AdminGate>
  );
}
