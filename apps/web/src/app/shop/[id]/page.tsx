"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
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
    deliveryAddress: "" 
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => onAuthStateChanged(auth, (signedInUser) => {
    setUser(signedInUser);
    if (!signedInUser) return;
    setFormData((current) => ({ ...current, customerName: current.customerName || signedInUser.displayName || '', customerEmail: current.customerEmail || signedInUser.email || '' }));
    getDoc(doc(db, 'users', signedInUser.uid)).then((snapshot) => {
      if (!snapshot.exists()) return;
      const details = snapshot.data();
      setFormData((current) => ({ ...current, customerName: current.customerName || details.name || '', customerPhone: current.customerPhone || details.phone || '', whatsappNumber: current.whatsappNumber || details.whatsappNumber || '', customerEmail: current.customerEmail || details.email || signedInUser.email || '', deliveryAddress: current.deliveryAddress || [details.address, details.city, details.state, details.pincode].filter(Boolean).join(', ') }));
    }).catch((error) => console.error('Could not load saved profile', error));
  }), []);

  const signInWithGoogle = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (error) { console.error('Google sign-in failed:', error); alert('Google sign-in could not be completed. Please try again.'); }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      try {
        const docRef = doc(db, "products", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().status === "Available") {
          setProduct({ id: docSnap.id, ...docSnap.data() } as ProductDetails);
        } else {
          router.push("/shop");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      if (!user) throw new Error('Sign in is required to place an order.');
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.customerName, email: formData.customerEmail, phone: formData.customerPhone,
        whatsappNumber: formData.whatsappNumber, address: formData.deliveryAddress, updatedAt: serverTimestamp(),
      }, { merge: true });
      const orderRef = await addDoc(collection(db, "buyOrders"), {
        productId: product.id,
        deviceName: `${product.brand} ${product.deviceName}`,
        price: product.price,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        whatsappNumber: formData.whatsappNumber,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        userId: user.uid,
        status: "Pending Delivery",
        createdAt: serverTimestamp(),
      });

      setOrderId(orderRef.id);
      await updateDoc(doc(db, "products", product.id), { status: "Reserved" });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Unable to place order right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-space text-xl">Loading Device...</div>;
  }

  if (!product) return null;

  if (orderId) {
    return (
      <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-[#E3D9F9] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-black text-[#1E1B29]">Order placed successfully</h1>
          <p className="mt-3 text-[#6E6683]">Your order reference is below. Keep it safe for tracking.</p>
          <div className="mt-6 rounded-2xl bg-[#F3ECFF] p-4 font-mono text-lg font-semibold text-[#7C3AED]">{orderId}</div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/track-purchase?order=${orderId}`} className="rounded-xl bg-[#1E1B29] px-5 py-3 font-bold text-white">Track Order</Link>
            <Link href="/shop" className="rounded-xl border border-[#E3D9F9] px-5 py-3 font-bold text-[#1E1B29]">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="max-w-[1000px] mx-auto px-6 pt-10">
        <div className="bg-white rounded-3xl border-[1.5px] border-[#EFE9FB] p-8 md:p-12 flex flex-col md:flex-row gap-12 shadow-sm">
          
          {/* Left: Image Container with Slider */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-square bg-[#F3ECFF] rounded-2xl p-8 flex items-center justify-center border border-[#E3D9F9] relative group">
              {imagesList.length > 0 ? (
                <>
                  <img src={imagesList[activeImageIdx]} alt={product.deviceName} className="max-h-full object-contain" />
                  
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

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-[0.8rem] font-bold text-[#7C3AED] uppercase tracking-wider bg-[#F3ECFF] px-3 py-1.5 rounded-lg">
                {product.brand} {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E1B29] mt-4 mb-2 leading-tight">
              {product.deviceName}
            </h1>
            <p className="text-[#6E6683] mb-6">{product.storage} • {product.specs}</p>

            <div className="bg-[#FAF7FF] border border-[#E3D9F9] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1E1B29] text-[1.1rem]">Ready for COD</h3>
                  <p className="text-[#6E6683] text-[0.95rem]">Fully tested and available for instant delivery.</p>
                </div>
                <div className="text-2xl font-black text-[#7C3AED]">₹{product.price.toLocaleString()}</div>
              </div>
            </div>

            {!ordering ? <button type="button" onClick={() => setOrdering(true)} className="w-full rounded-xl bg-[#5B21B6] py-4 font-bold text-white transition-colors hover:bg-[#3D1E7A]">Buy now</button> : !user ? <div className="rounded-2xl border border-[#E3D9F9] bg-[#FAF7FF] p-5 text-center"><h2 className="text-lg font-bold text-[#1E1B29]">Sign in to continue</h2><p className="mt-2 text-sm text-[#6E6683]">Use your Google account to continue securely to delivery details.</p><button type="button" onClick={signInWithGoogle} className="mt-4 w-full rounded-xl border border-[#E3D9F9] bg-white py-3 font-bold text-[#1E1B29] hover:bg-[#F3ECFF]"><span aria-hidden="true">G</span> Continue with Google</button><button type="button" onClick={() => setOrdering(false)} className="mt-3 text-sm font-semibold text-[#5B21B6]">Back to device details</button></div> : <form onSubmit={handleSubmitOrder} className="space-y-4">
              <p className="text-sm font-semibold text-[#5B21B6]">Signed in as {user.displayName || user.email}</p>
              <input required value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Full name" />
              <input required value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Phone number" />
              <input required value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="WhatsApp number" />
              <input required type="email" value={formData.customerEmail} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} className="w-full rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Email address" />
              <textarea required value={formData.deliveryAddress} onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})} className="min-h-24 w-full rounded-xl border border-[#E3D9F9] px-4 py-3" placeholder="Delivery address" />
              <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#5B21B6] py-4 font-bold text-white transition-colors hover:bg-[#3D1E7A] disabled:opacity-70">
                {submitting ? "Placing order..." : "Place COD order"}
              </button>
            </form>}
            <p className="mt-4 text-center text-[0.8rem] text-[#A79CBE]">
              Includes 6-month warranty and free shipping.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
