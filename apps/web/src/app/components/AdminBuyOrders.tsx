"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";

interface BuyOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  whatsappNumber?: string;
  customerEmail?: string;
  deliveryAddress: string;
  deviceName: string;
  price: number;
  amountPaid?: number | null; // How much customer actually paid
  status: string; // "Pending Delivery" | "YES CUSTOMER BUYED" | "CUSTOMER NOT BUYED" | "Cancelled" | etc.
  createdAt: any;
  productId: string;
  days?: string;
}

export default function AdminBuyOrders() {
  const [orders, setOrders] = useState<BuyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<BuyOrder | null>(null);
  
  // Edit Form Fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDeviceName, setEditDeviceName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAmountPaid, setEditAmountPaid] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDays, setEditDays] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "buyOrders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersList: BuyOrder[] = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() } as BuyOrder);
      });
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching buy orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteDoc(doc(db, "buyOrders", orderId));
      setOrders(prev => prev.filter(o => o.id !== orderId));
      alert("Order deleted successfully.");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order.");
    }
  };

  const handleOpenEdit = (order: BuyOrder) => {
    setEditingOrder(order);
    setEditName(order.customerName || "");
    setEditPhone(order.customerPhone || "");
    setEditWhatsapp(order.whatsappNumber || "");
    setEditEmail(order.customerEmail || "");
    setEditAddress(order.deliveryAddress || "");
    setEditDeviceName(order.deviceName || "");
    setEditPrice(String(order.price || 0));
    setEditAmountPaid(order.amountPaid != null ? String(order.amountPaid) : "");
    setEditStatus(order.status || "Pending Delivery");
    setEditDays(order.days || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setSaving(true);
    try {
      const orderRef = doc(db, "buyOrders", editingOrder.id);
      const payload = {
        customerName: editName,
        customerPhone: editPhone,
        whatsappNumber: editWhatsapp,
        customerEmail: editEmail,
        deliveryAddress: editAddress,
        deviceName: editDeviceName,
        price: Number(editPrice),
        amountPaid: editAmountPaid ? Number(editAmountPaid) : null,
        status: editStatus,
        days: editDays,
      };

      await updateDoc(orderRef, payload);
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, ...payload } : o));
      setEditingOrder(null);
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order details.");
    } finally {
      setSaving(false);
    }
  };

  // Record the outcome first, then open WhatsApp with the relevant customer message.
  const handleSendWhatsApp = async (order: BuyOrder, type: "success" | "fail") => {
    const rawNumber = order.whatsappNumber || order.customerPhone;
    if (!rawNumber) {
      return alert("No phone or WhatsApp number available.");
    }

    // Clean number: keep only digits
    let cleanNumber = rawNumber.replace(/\D/g, "");
    if (cleanNumber.length === 10) {
      cleanNumber = "91" + cleanNumber; // default to India code
    }

    const status = type === 'success' ? 'YES CUSTOMER BUYED' : 'CUSTOMER NOT BUYED';
    try {
      await updateDoc(doc(db, 'buyOrders', order.id), { status, updatedAt: new Date() });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
    } catch (error) {
      console.error('Could not record order outcome', error);
      alert('The order outcome could not be saved.');
      return;
    }

    const message = type === "success"
      ? `You successfully bought ${order.deviceName} with Selltronics.`
      : `Your purchase of ${order.deviceName} was not completed.`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return <div className="p-8 text-center text-[#6E6683] font-bold animate-pulse">Loading buyer orders...</div>;
  }

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border-[1.5px] border-[#EFE9FB] w-full font-space">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1B29]">Customer Purchases (COD)</h2>
        <p className="text-[#6E6683] text-sm mt-1">Manage outbound deliveries, edit customer data, and send WhatsApp receipts.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-10 bg-[#FAF7FF] rounded-2xl border border-dashed border-[#E3D9F9]">
          <p className="text-[#A79CBE] font-semibold">No purchase orders found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={`p-6 rounded-2xl border-[1.5px] flex flex-col gap-4 transition-all bg-white border-[#EFE9FB] hover:border-[#7C3AED]`}
            >
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#FAF7FF] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black bg-[#1E1B29] text-white px-2 py-1 rounded-md">
                    ORDER #{order.id.slice(0, 6).toUpperCase()}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    order.status === "YES CUSTOMER BUYED" ? "bg-green-100 text-green-700" :
                    order.status === "CUSTOMER NOT BUYED" ? "bg-red-100 text-red-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#7C3AED]">
                  Quoted: ₹{order.price.toLocaleString()} | Paid: {order.amountPaid != null ? `₹${order.amountPaid.toLocaleString()}` : "—"}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="text-base font-bold text-[#1E1B29] mb-2">{order.deviceName}</h3>
                  <p className="mb-1"><strong className="text-[#6E6683]">Customer:</strong> {order.customerName}</p>
                  <p className="mb-1"><strong className="text-[#6E6683]">Phone:</strong> {order.customerPhone}</p>
                  <p className="mb-1"><strong className="text-[#6E6683]">WhatsApp:</strong> {order.whatsappNumber || "Same as Phone"}</p>
                  <p className="mb-1"><strong className="text-[#6E6683]">Email:</strong> {order.customerEmail || "N/A"}</p>
                  <p className="mb-1"><strong className="text-[#6E6683]">Estimated Delivery:</strong> {order.days ? `${order.days}` : "Not scheduled yet"}</p>
                </div>
                <div>
                  <p className="mb-2"><strong className="text-[#6E6683]">Delivery Address:</strong></p>
                  <p className="bg-[#FAF7FF] p-3 rounded-xl border border-[#EFE9FB] text-xs leading-relaxed text-gray-700">{order.deliveryAddress}</p>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#FAF7FF] pt-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(order)}
                    className="px-4 py-2 bg-[#F3ECFF] text-[#7C3AED] rounded-xl text-xs font-bold hover:bg-[#E3D9F9] transition-colors cursor-pointer"
                  >
                    Edit Order
                  </button>
                  <button 
                    onClick={() => handleDeleteOrder(order.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSendWhatsApp(order, "success")}
                    className="px-3.5 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    Notify Success (WhatsApp)
                  </button>
                  <button 
                    onClick={() => handleSendWhatsApp(order, "fail")}
                    className="px-3.5 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    Notify Fail (WhatsApp)
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="overlay open">
          <div className="modal" style={{ maxWidth: 580 }}>
            <button className="modal-close" onClick={() => setEditingOrder(null)}>×</button>
            <h3 className="text-lg font-bold text-[#1E1B29] mb-4">Edit Customer Order</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <label className="field block">
                  <span className="font-bold">Customer Name</span>
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

              <label className="field block">
                <span className="font-bold">Device Name</span>
                <input required value={editDeviceName} onChange={(e) => setEditDeviceName(e.target.value)} />
              </label>

              <div className="grid grid-cols-4 gap-4">
                <label className="field block">
                  <span className="font-bold">Quoted Price (₹)</span>
                  <input required type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                </label>
                <label className="field block">
                  <span className="font-bold">Amount Paid (₹)</span>
                  <input type="number" value={editAmountPaid} onChange={(e) => setEditAmountPaid(e.target.value)} placeholder="0" />
                </label>
                <label className="field block">
                  <span className="font-bold">Status</span>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-2 border rounded-xl">
                    <option value="Pending Delivery">Pending Delivery</option>
                    <option value="YES CUSTOMER BUYED">YES CUSTOMER BUYED</option>
                    <option value="CUSTOMER NOT BUYED">CUSTOMER NOT BUYED</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </label>
                <label className="field block">
                  <span className="font-bold">Estimated Days</span>
                  <input value={editDays} onChange={(e) => setEditDays(e.target.value)} placeholder="e.g. 3 days" />
                </label>
              </div>

              <label className="field block">
                <span className="font-bold">Delivery Address</span>
                <textarea required value={editAddress} onChange={(e) => setEditAddress(e.target.value)} rows={3} />
              </label>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#1E1B29] text-white py-3 rounded-xl font-bold hover:bg-[#3D1E7A] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Order Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
