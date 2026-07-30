"use client";

import { useState, useEffect } from 'react';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';

type SellRequest = { 
  id: string; 
  userName?: string; 
  deviceType?: string; 
  deviceName?: string; 
  brand?: string; 
  expectedPrice?: number; 
  finalAmount?: number; 
  status?: string; 
  paymentStatus?: string; 
  paymentMethod?: string; 
  customerPhone?: string; 
  whatsappNumber?: string; 
  customerEmail?: string;
  specs?: string; 
  storage?: string; 
  defects?: string[]; 
  problems?: string[]; 
  images?: string[]; 
  locationAddress?: string;
  locationCity?: string;
  locationState?: string;
  locationPincode?: string;
  days?: string;
};

const statuses = [
  'pickup_requested', 
  'pickup_scheduled', 
  'inspected', 
  'YES CUSTOMER SOLD', 
  'CUSTOMER NOT SOLD', 
  'Cancelled',
  'completed', 
  'rejected'
];

export default function AdminSellRequests({ requests: propRequests }: { requests?: SellRequest[] }) {
  const [requests, setRequests] = useState<SellRequest[]>(propRequests || []);
  const [loading, setLoading] = useState(!propRequests);
  const [selected, setSelected] = useState<SellRequest | null>(null);
  const [editing, setEditing] = useState<SellRequest | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Review Status fields
  const [status, setStatus] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [pickupDays, setPickupDays] = useState('');

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editExpectedPrice, setEditExpectedPrice] = useState('');

  useEffect(() => {
    if (propRequests) {
      setRequests(propRequests);
      setLoading(false);
      return;
    }
    const fetchRequests = async () => {
      try {
        const q = query(collection(db, "sellRequests"), orderBy("submittedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const reqList: SellRequest[] = [];
        querySnapshot.forEach((doc) => {
          reqList.push({ id: doc.id, ...doc.data() } as SellRequest);
        });
        setRequests(reqList);
      } catch (error) {
        console.error("Error fetching sell requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [propRequests]);

  const openReview = (request: SellRequest) => {
    setSelected(request);
    setStatus(request.status || 'pickup_requested');
    setFinalAmount(request.finalAmount ? String(request.finalAmount) : '');
    setPaymentMethod(request.paymentMethod || 'Cash');
    setPickupDays(request.days || '');
  };

  const handleOpenEdit = (request: SellRequest) => {
    setEditing(request);
    setEditName(request.userName || '');
    setEditPhone(request.customerPhone || '');
    setEditWhatsapp(request.whatsappNumber || '');
    setEditEmail(request.customerEmail || '');
    setEditAddress(request.locationAddress || '');
    setEditCity(request.locationCity || '');
    setEditState(request.locationState || '');
    setEditPincode(request.locationPincode || '');
    setEditDeviceName(request.deviceName || '');
    setEditBrand(request.brand || '');
    setEditExpectedPrice(String(request.expectedPrice || 0));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        userName: editName,
        customerPhone: editPhone,
        whatsappNumber: editWhatsapp,
        customerEmail: editEmail,
        locationAddress: editAddress,
        locationCity: editCity,
        locationState: editState,
        locationPincode: editPincode,
        deviceName: editDeviceName,
        brand: editBrand,
        expectedPrice: Number(editExpectedPrice),
      };
      await updateDoc(doc(db, 'sellRequests', editing.id), payload);
      alert('Seller details updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Failed to update seller details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this sell request totally?")) return;
    try {
      await deleteDoc(doc(db, 'sellRequests', requestId));
      alert('Sell request deleted successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting sell request:', error);
      alert('Failed to delete.');
    }
  };

  const saveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'sellRequests', selected.id), {
        status,
        finalAmount: finalAmount ? Number(finalAmount) : null,
        paymentMethod,
        days: pickupDays,
        paymentStatus: status === 'YES CUSTOMER SOLD' || status === 'completed' ? 'paid' : 'pending_inspection',
        updatedAt: new Date()
      });
      alert('Status and amount saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Could not update sell request', error);
      alert('Failed to save status.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendWhatsApp = async (request: SellRequest, type: "success" | "fail") => {
    const rawNumber = request.whatsappNumber || request.customerPhone;
    if (!rawNumber) {
      return alert("No WhatsApp/phone number available.");
    }

    let cleanNumber = rawNumber.replace(/\D/g, "");
    if (cleanNumber.length === 10) {
      cleanNumber = "91" + cleanNumber;
    }

    const outcomeStatus = type === 'success' ? 'YES CUSTOMER SOLD' : 'CUSTOMER NOT SOLD';
    try {
      const payload = {
        status: outcomeStatus,
        paymentStatus: type === 'success' ? 'paid' : 'not_paid',
        ...(type === 'success' && finalAmount ? { finalAmount: Number(finalAmount) } : {}),
        updatedAt: new Date(),
      };
      await updateDoc(doc(db, 'sellRequests', request.id), payload);
      setRequests((current) => current.map((item) => item.id === request.id ? { ...item, ...payload } : item));
      setSelected((current) => current?.id === request.id ? { ...current, ...payload } : current);
    } catch (error) {
      console.error('Could not record sell outcome', error);
      alert('The sell outcome could not be saved.');
      return;
    }

    const device = `${request.brand || ''} ${request.deviceName || request.deviceType || 'device'}`.trim();
    const message = type === "success"
      ? `You successfully sold your ${device} with Selltronics.`
      : `Your sale request for ${device} was not completed.`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return <div className="p-8 text-center text-[#6E6683] font-bold animate-pulse">Loading sell requests...</div>;
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Seller</th>
              <th>Device</th>
              <th>Expected</th>
              <th>Final Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>No sell requests found</td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td style={{ fontWeight: 600 }}>#{request.id.slice(0, 6)}</td>
                  <td>
                    <div>{request.userName || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{request.customerPhone}</div>
                  </td>
                  <td>{request.brand} {request.deviceName || request.deviceType}</td>
                  <td>₹{Number(request.expectedPrice || 0).toLocaleString('en-IN')}</td>
                  <td>₹{request.finalAmount ? Number(request.finalAmount).toLocaleString('en-IN') : '—'}</td>
                  <td>
                    <span className={`badge ${
                      request.status === 'YES CUSTOMER SOLD' || request.status === 'completed' ? 'success' : 
                      request.status === 'CUSTOMER NOT SOLD' || request.status === 'rejected' || request.status === 'Cancelled' ? 'danger' : 
                      'pending'
                    }`}>
                      {(request.status || 'pickup requested').replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }} type="button" onClick={() => openReview(request)}>Review & Outcome</button>
                      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem', borderColor: '#E3D9F9' }} type="button" onClick={() => handleOpenEdit(request)}>Edit</button>
                      <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#991B1B', borderColor: '#FEE2E2' }} type="button" onClick={() => handleDelete(request.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review & Status Outcome Modal */}
      {selected && (
        <div className="overlay open">
          <div className="modal" style={{ maxWidth: 720 }}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <h3 className="text-xl font-bold mb-2">Evaluate Device & Set Outcome</h3>
            
            <div style={{ background: '#FAF7FF', padding: '16px', borderRadius: '14px', border: '1px solid #EFE9FB', marginBottom: '18px' }} className="space-y-2 text-sm">
              <p><strong className="text-[#1E1B29]">Seller:</strong> {selected.userName} · {selected.customerPhone} · Email: {selected.customerEmail || '—'} · WhatsApp: {selected.whatsappNumber || '—'}</p>
              <p><strong className="text-[#1E1B29]">Device:</strong> <b>{selected.brand} {selected.deviceName}</b> ({selected.storage || 'N/A'} · {selected.specs || 'N/A'})</p>
              <p><strong className="text-[#1E1B29]">Location:</strong> {selected.locationAddress || 'N/A'}, {selected.locationCity || ''}, {selected.locationState || ''} {selected.locationPincode || ''}</p>
              <p><strong className="text-[#1E1B29]">Defects Chosen:</strong> {selected.defects?.join(', ') || 'None'}</p>
              <p><strong className="text-[#1E1B29]">Problems Chosen:</strong> {selected.problems?.join(', ') || 'None'}</p>
            </div>

            {selected.images?.length ? (
              <div style={{ marginBottom: '18px' }}>
                <p className="font-bold text-sm mb-2">Uploaded Device Images:</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                  {selected.images.map((image, index) => (
                    <img key={index} src={image} alt={`Device upload ${index + 1}`} style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 8, background: '#FFF', border: '1px solid #E3D9F9' }} />
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '18px' }}>No device images uploaded.</p>
            )}

            <div className="sell-form-grid" style={{ marginBottom: '18px' }}>
              <label className="field">
                <span>Operational Status Outcome</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {statuses.map((item) => (
                    <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Finalized Paid Amount (₹)</span>
                <input type="number" min="0" value={finalAmount} onChange={(e) => setFinalAmount(e.target.value)} placeholder="How much customer received" />
              </label>
              <label className="field">
                <span>Payment Method</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Google Pay</option>
                  <option>Bank Transfer</option>
                </select>
              </label>
              <label className="field">
                <span>Pickup timeline for customer</span>
                <input value={pickupDays} onChange={(e) => setPickupDays(e.target.value)} placeholder="e.g. Pickup in 2 days" />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'between', gap: '10px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} disabled={saving} onClick={saveStatus}>
                {saving ? 'Saving…' : 'Save Status & Amount'}
              </button>
              <button className="btn-primary" style={{ background: '#22C55E', color: 'white' }} onClick={() => handleSendWhatsApp(selected, "success")}>
                Notify Success (WhatsApp)
              </button>
              <button className="btn-ghost" style={{ borderColor: '#FEE2E2', color: '#EF4444' }} onClick={() => handleSendWhatsApp(selected, "fail")}>
                Notify Fail (WhatsApp)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Seller Details Modal */}
      {editing && (
        <div className="overlay open">
          <div className="modal" style={{ maxWidth: 640 }}>
            <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            <h3 className="text-lg font-bold mb-4">Edit Seller & Device Details</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <label className="field block">
                  <span className="font-bold">Seller Name</span>
                  <input required value={editName} onChange={(e) => setEditName(e.target.value)} />
                </label>
                <label className="field block">
                  <span className="font-bold">Phone Number</span>
                  <input required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="field block">
                  <span className="font-bold">WhatsApp Number</span>
                  <input value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} />
                </label>
                <label className="field block">
                  <span className="font-bold">Email Address</span>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="field block">
                  <span className="font-bold">Device Brand</span>
                  <input required value={editBrand} onChange={(e) => setEditBrand(e.target.value)} />
                </label>
                <label className="field block">
                  <span className="font-bold">Device Model</span>
                  <input required value={editDeviceName} onChange={(e) => setEditDeviceName(e.target.value)} />
                </label>
                <label className="field block">
                  <span className="font-bold">Expected Price (₹)</span>
                  <input required type="number" value={editExpectedPrice} onChange={(e) => setEditExpectedPrice(e.target.value)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="field block">
                  <span className="font-bold">Full Address</span>
                  <input required value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                </label>
                <label className="field block">
                  <span className="font-bold">City</span>
                  <input required value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="field block">
                  <span className="font-bold">State</span>
                  <input required value={editState} onChange={(e) => setEditState(e.target.value)} />
                </label>
                <label className="field block">
                  <span className="font-bold">Pincode</span>
                  <input required value={editPincode} onChange={(e) => setEditPincode(e.target.value)} />
                </label>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#1E1B29] text-white py-3 rounded-xl font-bold hover:bg-[#3D1E7A] transition-colors"
              >
                {saving ? 'Saving...' : 'Save Seller Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
