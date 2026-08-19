'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

type RepairRequest = {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerWhatsapp?: string;
  brand?: string;
  model?: string;
  service?: string;
  status?: string;
  createdAt?: { toDate?: () => Date } | string;
};

const statusOptions = ['pending_pickup', 'picked_up', 'in_repair', 'ready', 'delivered', 'cancelled'];

export default function AdminRepairsTable({ requests, onRefresh }: { requests: RepairRequest[]; onRefresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'repair_requests', editing), {
        status,
        updatedAt: new Date(),
      });
      setEditing(null);
      if (onRefresh) onRefresh();
      else window.location.reload();
    } catch (error) {
      console.error('Could not update repair request status:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatStatus = (s: string) => {
    return s.replace(/_/g, ' ').toUpperCase();
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'in_repair':
        return 'warning';
      default:
        return 'pending';
    }
  };

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Device Model</th>
              <th>Repair Service</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  No repair requests found
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>#{req.id.slice(0, 6)}</td>
                  <td style={{ fontWeight: 600 }}>{req.customerName || 'N/A'}</td>
                  <td>
                    <div>{req.customerPhone || 'N/A'}</div>
                    {req.customerWhatsapp && (
                      <small style={{ color: '#10B981', display: 'block', fontSize: '0.75rem' }}>
                        💬 WhatsApp: {req.customerWhatsapp}
                      </small>
                    )}
                  </td>
                  <td>
                    <strong>{req.brand || 'N/A'}</strong> {req.model || 'N/A'}
                  </td>
                  <td>
                    <span
                      style={{
                        background: 'var(--lavender-100)',
                        color: 'var(--violet-700)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                      }}
                    >
                      {req.service || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(req.status || 'pending_pickup')}`}>
                      {formatStatus(req.status || 'pending_pickup')}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() => {
                        setEditing(req.id);
                        setStatus(req.status || 'pending_pickup');
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="overlay open">
          <div className="modal">
            <button className="modal-close" onClick={() => setEditing(null)}>
              ×
            </button>
            <h3>Update Repair Request</h3>
            <p>Modify the status of this doorstep service request.</p>
            <label className="field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {formatStatus(opt)}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn-primary" disabled={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save Status'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
