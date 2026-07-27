"use client";

import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

interface OrderData {
  deviceName: string;
  price: number;
  status?: "Pending Delivery" | "Delivered" | "Cancelled" | string;
  customerName: string;
  deliveryAddress: string;
}

export default function TrackPurchasePage() {
  const [orderId, setOrderId] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('order') || '');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setOrderData(null);

    try {
      const orderRef = doc(db, "buyOrders", orderId.trim());
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        setOrderData(orderSnap.data() as OrderData);
      } else {
        setError("No order found with that ID. Please check and try again.");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Something went wrong while fetching your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center p-6 font-space">
      <div className="w-full max-w-lg">
        
        {/* Tracking Input Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border-[1.5px] border-[#EFE9FB] mb-6">
          <h1 className="text-2xl font-black text-[#1E1B29] mb-2">Track Your Purchase</h1>
          <p className="text-[#6E6683] text-sm mb-6">Enter your Order ID below to check the delivery status of your Cash on Delivery order.</p>

          <form onSubmit={handleTrackOrder} className="flex flex-col gap-4">
            <div>
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. 5xY9...)" 
                className="w-full px-5 py-4 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none text-[#1E1B29] font-bold tracking-wide"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !orderId}
              className="w-full bg-[#1E1B29] text-white py-4 rounded-xl font-bold hover:bg-[#3D1E7A] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-sm font-semibold mt-4 text-center">{error}</p>
          )}
        </div>

        {/* Order Status Display */}
        {orderData && (
          <div className={`p-8 rounded-3xl border-[1.5px] transition-all animate-in zoom-in duration-300 ${
            orderData.status === "Delivered" 
              ? "bg-green-50 border-green-200" 
              : "bg-white border-[#7C3AED] shadow-lg shadow-[#7C3AED]/10"
          }`}>
            
            {orderData.status === "Delivered" ? (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-green-700">Delivery Successful!</h2>
                <p className="text-green-600 text-sm mt-1 font-semibold">Thank you for purchasing from SellTronics.</p>
              </div>
            ) : orderData.status === "Cancelled" ? (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-red-600">×</div>
                <h2 className="text-2xl font-black text-red-700">Order cancelled</h2>
                <p className="text-red-600 text-sm mt-1 font-semibold">This order is no longer scheduled for delivery.</p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#F3ECFF] border-2 border-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#7C3AED]" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-[#1E1B29]">Pending Delivery</h2>
                <p className="text-[#6E6683] text-sm mt-1 font-semibold">Your device is on the way. Please keep cash ready.</p>
              </div>
            )}

            <div className="space-y-4 bg-white/60 p-5 rounded-2xl">
              <div>
                <p className="text-[0.7rem] font-bold text-[#6E6683] uppercase tracking-wider">Device</p>
                <p className="text-lg font-bold text-[#1E1B29]">{orderData.deviceName || 'Pre-Owned device'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.7rem] font-bold text-[#6E6683] uppercase tracking-wider">Customer</p>
                  <p className="text-sm font-bold text-[#1E1B29]">{orderData.customerName}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold text-[#6E6683] uppercase tracking-wider">COD Amount</p>
                  <p className="text-sm font-black text-[#7C3AED]">₹{orderData.price.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-[0.7rem] font-bold text-[#6E6683] uppercase tracking-wider">Delivery Address</p>
                <p className="text-sm font-semibold text-[#1E1B29]">{orderData.deliveryAddress}</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
