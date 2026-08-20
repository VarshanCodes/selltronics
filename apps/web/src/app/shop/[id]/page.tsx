"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, type User } from "firebase/auth";
import Link from "next/link";
import { db } from "../../../config/firebase";
import { auth } from "../../../config/firebase";

interface ProductDetails {
  id: string;
  category: string;
  brand: string;
  deviceName: string;
  storage: string;
  specs: string;
  price: number;
  originalPrice?: number;
  deviceImageCode: string | null;
  deviceImages?: string[];
  status: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    customerName: "", 
    customerPhone: "", 
    whatsappNumber: "", 
    customerEmail: "", 
    deliveryAddress: "",
    landmark: "",
    pincode: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const orderDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => onAuthStateChanged(auth, (signedInUser) => {
    setUser(signedInUser);
    if (!signedInUser) return;
    setFormData((current) => ({ ...current, customerName: current.customerName || signedInUser.displayName || '', customerEmail: current.customerEmail || signedInUser.email || '' }));
    getDoc(doc(db, 'users', signedInUser.uid)).then((snapshot) => {
      if (!snapshot.exists()) return;
      const details = snapshot.data();
      setFormData((current) => ({ ...current, customerName: current.customerName || details.name || '', customerPhone: current.customerPhone || details.phone || '', whatsappNumber: current.whatsappNumber || details.whatsappNumber || '', customerEmail: current.customerEmail || details.email || signedInUser.email || '', deliveryAddress: current.deliveryAddress || details.address || '', landmark: current.landmark || details.landmark || '', pincode: current.pincode || details.pincode || '' }));
    }).catch((error) => console.error('Could not load saved profile', error));
  }), []);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (error) { console.error('Google sign-in failed:', error); alert('Google sign-in could not be completed. Please try again.'); }
    finally { setSigningIn(false); }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      try {
        const docRef = doc(db, "products", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as ProductDetails);
        } else {
          router.push('/shop');
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  useEffect(() => {
    if (!ordering) return;
    requestAnimationFrame(() => orderDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [ordering]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      if (!user) throw new Error('Sign in is required to place an order.');
      const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
      const customer = {
        name: text(formData.customerName),
        email: text(formData.customerEmail),
        phone: text(formData.customerPhone),
        whatsappNumber: text(formData.whatsappNumber),
        address: text(formData.deliveryAddress),
      };

      // A customer profile is helpful for the next checkout, but an order must
      // not be lost if that optional profile update is unavailable.
      try {
        await setDoc(doc(db, 'users', user.uid), {
        ...customer,
        landmark: formData.landmark.trim(),
        pincode: formData.pincode.trim(),
        updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (profileError) {
        console.warn('Could not save the customer profile while ordering:', profileError);
      }
      const orderRef = await addDoc(collection(db, "orders"), {
        productId: product.id || "",
        deviceName: `${text(product.brand)} ${text(product.deviceName)}`.trim() || "",
        price: Number.isFinite(Number(product.price)) ? Number(product.price) : 0,
        customerName: customer.name || "",
        customerPhone: customer.phone || "",
        whatsappNumber: customer.whatsappNumber || "",
        customerEmail: customer.email || "",
        deliveryAddress: customer.address || "",
        landmark: formData.landmark.trim(),
        pincode: formData.pincode.trim(),
        notes: formData.notes.trim(),
        userId: user.uid || "",
        status: "Pending Delivery",
        createdAt: serverTimestamp(),
      });

      router.push(`/order-success?order=${encodeURIComponent(orderRef.id)}`);
    } catch (error) {
      console.error("Error creating buy order:", error);
      alert("Unable to place order right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-space text-xl">Loading Device...</div>;
  }

  if (!product) return null;

  const imagesList = product.deviceImages && product.deviceImages.length > 0
    ? product.deviceImages
    : (product.deviceImageCode ? [product.deviceImageCode] : []);

  const handleNextImg = () => {
    setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
  };
  const handlePrevImg = () => {
    setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <div className="min-h-screen bg-[#FAF7FF] font-space pb-20">
      {/* Simple Header */}
      <div className="bg-white border-b border-[#EFE9FB] py-5 px-8 flex items-center sticky top-0 z-10">
        <Link href="/shop" className="text-[#6E6683] hover:text-[#5B21B6] font-semibold flex items-center gap-2 transition-colors">
          <span>←</span> Back to Shop
        </Link>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="bg-white rounded-3xl border-[1.5px] border-[#EFE9FB] p-5 sm:p-8 md:p-12 flex flex-col md:flex-row gap-7 sm:gap-12 shadow-sm">
          
          {/* Left: Image Container with Slider */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-full relative group">
              {imagesList.length > 0 ? (
                <>
                  <img src={imagesList[activeImageIdx]} alt={product.deviceName} className="block w-full h-auto object-contain" />
                  
                  {imagesList.length > 1 && (
                    <>
                      <button 
                        type="button"
                        onClick={handlePrevImg}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1E1B29] w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold transition-all border border-[#EFE9FB] cursor-pointer"
                      >
                        ←
                      </button>
                      <button 
                        type="button"
                        onClick={handleNextImg}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1E1B29] w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold transition-all border border-[#EFE9FB] cursor-pointer"
                      >
                        →
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-[#A79CBE]">No Image Available</div>
              )}
            </div>

            {/* Slider Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white flex items-center justify-center p-1 cursor-pointer shrink-0 transition-all ${
                      activeImageIdx === idx ? 'border-[#7C3AED] shadow-sm' : 'border-[#E3D9F9]'
                    }`}
                  >
                    <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details or Checkout Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {ordering ? (
              <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-6 border-b border-[#EFE9FB] pb-4">
                  <button
                    type="button"
                    onClick={() => setOrdering(false)}
                    className="text-[#7C3AED] hover:text-[#5B21B6] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    ← Back to Product Details
                  </button>
                  <span className="text-xs font-semibold text-[#6E6683]">Checkout</span>
                </div>

                {!user ? (
                  <div className="rounded-2xl border border-[#E3D9F9] bg-[#FAF7FF] p-6 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white font-black text-[#5B21B6] shadow-sm">G</div>
                    <h2 className="mt-4 text-lg font-bold text-[#1E1B29]">Sign in to continue</h2>
                    <p className="mt-2 text-sm text-[#6E6683] mb-4">Your Google account keeps this order request and its delivery updates secure.</p>
                    <button 
                      type="button" 
                      onClick={signInWithGoogle} 
                      disabled={signingIn}
                      className="w-full rounded-xl border border-[#E3D9F9] bg-white py-3.5 font-bold text-[#1E1B29] hover:bg-[#F3ECFF] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.2 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.5 1.8 15 1 12.2 1 7.4 1 3.4 3.8 1.6 7.8l3.7 2.9C6.2 7.4 9 5 12.2 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3h-11v4.4h6.3c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.6-5 3.6-8.7z"/><path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.3C.6 9.2 0 11.3 0 13.5s.6 4.3 1.6 6.2l3.7-2.9z"/><path fill="#34A853" d="M12.2 19c-3.2 0-6-2.4-6.9-5.7L1.6 16.2C3.4 20.2 7.4 23 12.2 23c3 0 5.8-1 7.9-2.9l-3.7-2.9c-1.1.8-2.5 1.8-4.2 1.8z"/></svg>
                      {signingIn ? 'Signing in…' : 'Continue with Google'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="space-y-4 bg-white border border-[#EFE9FB] p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-[#1E1B29]">Delivery Details</h3>
                      <span className="text-xs text-[#6E6683]">Signed in as {user.email}</span>
                    </div>
                    
                    <div>
                      <label className="block text-[0.8rem] font-bold text-[#1E1B29] mb-1.5">Full Name</label>
                      <input required value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3 outline-none focus:border-[#7C3AED]" placeholder="Your name" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[0.8rem] font-bold text-[#1E1B29] mb-1.5">Phone Number</label>
                        <input required value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3 outline-none focus:border-[#7C3AED]" placeholder="Phone number" />
                      </div>
                      <div>
                        <label className="block text-[0.8rem] font-bold text-[#1E1B29] mb-1.5">WhatsApp Number</label>
                        <input required value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3 outline-none focus:border-[#7C3AED]" placeholder="For shipping updates" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[0.8rem] font-bold text-[#1E1B29] mb-1.5">Delivery Address</label>
                      <textarea required value={formData.deliveryAddress} onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})} className="min-h-24 w-full rounded-xl border border-[#E3D9F9] px-4 py-3 outline-none focus:border-[#7C3AED] resize-none" placeholder="House/flat, building name, street address" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-[0.8rem] font-bold text-[#1E1B29] mb-1.5">Landmark</label><input value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3 outline-none focus:border-[#7C3AED]" placeholder="Nearby landmark" /></div><div><label className="block text-[0.8rem] font-bold text-[#1E1B29] mb-1.5">Pincode</label><input required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3 outline-none focus:border-[#7C3AED]" placeholder="Pincode" /></div></div>
                    <div><label className="block text-[0.8rem] font-bold text-[#1E1B29] mb-1.5">Notes <span className="font-normal text-[#6E6683]">(optional)</span></label><textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="min-h-20 w-full rounded-xl border border-[#E3D9F9] px-4 py-3 outline-none focus:border-[#7C3AED] resize-none" placeholder="Anything that helps with delivery" /></div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#5B21B6] py-3.5 font-bold text-white transition-colors hover:bg-[#3D1E7A] disabled:opacity-70 cursor-pointer">
                        {submitting ? "Processing..." : "Place Order"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div className="mb-2">
                  <span className="text-[0.8rem] font-bold text-[#7C3AED] uppercase tracking-wider bg-[#F3ECFF] px-3 py-1.5 rounded-lg">
                    {product.brand} {product.category}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-[#1E1B29] mt-4 mb-2 leading-tight">
                  {product.deviceName}
                </h1>
                <div className="mb-6 space-y-3">
                  {product.storage && <span className="inline-block rounded-full bg-[#F3ECFF] px-3 py-1.5 text-sm font-extrabold text-[#5B21B6]">Storage: {product.storage}</span>}
                  {product.specs && <div className="rounded-xl border border-[#E3D9F9] bg-[#FAF7FF] p-4"><h2 className="text-sm font-extrabold uppercase tracking-wide text-[#1E1B29]">Device specifications</h2><p className="mt-2 whitespace-pre-line text-sm font-medium leading-6 text-[#6E6683]">{product.specs}</p></div>}
                </div>

                <div className="bg-[#FAF7FF] border border-[#E3D9F9] rounded-2xl p-4 sm:p-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#1E1B29] text-[0.9rem] uppercase tracking-wider text-gray-500">Price</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="offer-price text-3xl font-black">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice ? (
                          <span className="original-price text-sm">₹{product.originalPrice.toLocaleString()}</span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button" 
                      onClick={() => setOrdering(true)} 
                      className="w-full sm:w-auto shrink-0 rounded-xl bg-[#5B21B6] px-6 py-3.5 font-bold text-white transition-all hover:bg-[#3D1E7A] active:scale-[0.98] cursor-pointer shadow-md"
                    >
                      Buy Device
                    </button>
                  </div>
                </div>
                <p className="text-center text-[0.8rem] text-[#A79CBE]">
                  Includes 6-month warranty and free shipping.
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
