"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { db } from "../../../config/firebase";

interface ProductDetails {
  id: string;
  category: string;
  brand: string;
  deviceName: string;
  deviceImageCode: string | null;
  status: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      try {
        const docRef = doc(db, "products", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().status === "Available") {
          setProduct({ id: docSnap.id, ...docSnap.data() } as ProductDetails);
        } else {
          router.push("/shop"); // Redirect if already sold or invalid
        }
      } catch (error) {
        console.error("Error fetching product for checkout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Update the status to 'Sold' in Firestore
      const orderRef = doc(db, "products", product!.id);
      await updateDoc(orderRef, { status: "Reserved" });
      
      setPurchaseComplete(true);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-space text-xl">Preparing Checkout...</div>;
  }

  if (!product) return null;

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-[#FAF7FF] font-space flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl border-[1.5px] border-[#EFE9FB] max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-[#ECFDF3] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[#039855] text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E1B29] mb-3">Order Confirmed!</h1>
          <p className="text-[#6E6683] mb-8">
            You successfully purchased the {product.brand} {product.deviceName}. It will be shipped within 24 hours.
          </p>
          <Link href="/shop" className="block w-full bg-[#5B21B6] text-white py-3.5 rounded-xl font-bold hover:bg-[#3D1E7A] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7FF] font-space pb-20">
      <div className="bg-white border-b border-[#EFE9FB] py-5 px-8 flex items-center sticky top-0 z-10">
        <Link href={`/shop/${product.id}`} className="text-[#6E6683] hover:text-[#5B21B6] font-semibold flex items-center gap-2 transition-colors">
          <span>←</span> Back to Product
        </Link>
      </div>

      <div className="max-w-[800px] mx-auto px-6 pt-10">
        <h1 className="text-3xl font-bold text-[#1E1B29] mb-8">Secure Checkout</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl border-[1.5px] border-[#EFE9FB] p-6 shadow-sm h-fit">
            <h2 className="font-bold text-[#1E1B29] mb-4 text-lg">Order Summary</h2>
            <div className="flex items-center gap-4 border-b border-[#EFE9FB] pb-4 mb-4">
              <div className="w-16 h-16 bg-[#FAF7FF] rounded-lg border border-[#E3D9F9] flex items-center justify-center p-2">
                {product.deviceImageCode ? (
                  <img src={product.deviceImageCode} alt={product.deviceName} className="max-h-full object-contain" />
                ) : (
                  <span className="text-[0.6rem] text-[#A79CBE]">No Img</span>
                )}
              </div>
              <div>
                <div className="text-[0.75rem] font-bold text-[#7C3AED] uppercase">{product.category}</div>
                <div className="font-bold text-[#1E1B29] line-clamp-1">{product.deviceName}</div>
              </div>
            </div>
            <div className="flex justify-between text-[#6E6683] text-sm mb-2">
              <span>Subtotal</span>
              <span>Calculated at next step</span>
            </div>
            <div className="flex justify-between text-[#6E6683] text-sm mb-4">
              <span>Shipping</span>
              <span className="text-[#039855]">Free</span>
            </div>
          </div>

          {/* Dummy Shipping/Payment Form */}
          <form onSubmit={handleCheckout} className="bg-white rounded-2xl border-[1.5px] border-[#EFE9FB] p-6 shadow-sm">
            <h2 className="font-bold text-[#1E1B29] mb-4 text-lg">Shipping Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[0.85rem] font-semibold text-[#1E1B29] mb-1.5">Full Name</label>
                <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none" />
              </div>
              <div>
                <label className="block text-[0.85rem] font-semibold text-[#1E1B29] mb-1.5">Delivery Address</label>
                <input type="text" required placeholder="123 Main St, City" className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-[#5B21B6] text-white py-4 rounded-xl font-bold hover:bg-[#3D1E7A] transition-colors disabled:bg-[#D8CDEF]"
            >
              {isProcessing ? "Processing..." : "Complete Purchase"}
            </button>
            <p className="text-center text-[0.75rem] text-[#A79CBE] mt-3">
              This is a demo. No real payment is processed.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}