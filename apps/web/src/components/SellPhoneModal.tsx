"use client";

import { useState } from "react";
import Image from "next/image";
// Import the database function you just created (adjust the path if your db.ts is in a different folder)
import { submitSellOrder } from "../db"; 

interface SellPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellPhoneModal({ isOpen, onClose }: SellPhoneModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  
  const [modelName, setModelName] = useState("");
  const [conditions, setConditions] = useState({
    screenDamaged: false,
    bodyScratches: false,
    batteryIssue: false
  });
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state

  const phoneBrands = [
    { name: 'Apple', logo: '/brands/apple.png' },
    { name: 'Samsung', logo: '/brands/samsung.png' },
    { name: 'OnePlus', logo: '/brands/oneplus.png' },
    { name: 'Vivo', logo: '/brands/vivo.png' }
  ];
  const moreBrands = ['Xiaomi', 'POCO', 'Infinix', 'Pixel', 'Oppo', 'Moto'];

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedBrand(null);
      setModelName("");
      setConditions({ screenDamaged: false, bodyScratches: false, batteryIssue: false });
      setImageBase64(null);
      setShowMoreBrands(false);
      setIsSubmitting(false);
    }, 300); 
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // UPDATED: Now an async function that sends data to Firebase
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload = {
      deviceCategory: "Smartphone",
      brand: selectedBrand,
      model: modelName,
      issues: conditions,
      deviceImageCode: imageBase64,
      status: "Pending Admin Review",
      timestamp: new Date().toISOString()
    };
    
    const result = await submitSellOrder(orderPayload);

    if (result.success) {
      alert(`Success! Order ID: ${result.orderId}. Your device is registered in the system.`);
      handleClose();
    } else {
      alert("Failed to connect to the database. Please check your Firebase config.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[96] bg-white overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-6 opacity-0 pointer-events-none'}`}>
      
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#EFE9FB] sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2.5 font-space font-bold text-[1.1rem] text-[#1E1B29]">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#1B0F33] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8"/></svg>
          </div>
          SellTronics
        </div>
        <button onClick={handleClose} className="w-[38px] h-[38px] rounded-full border-[1.5px] border-[#E3D9F9] flex items-center justify-center hover:bg-[#F3ECFF] transition-colors cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="max-w-[780px] mx-auto px-6 pt-7.5 pb-24">
        
        {step === 1 && (
          <div className="animate-[fade-in-up_0.4s_ease-out]">
            <h2 className="text-[1.3rem] text-[#1E1B29] font-space font-bold mb-4.5">Select Phone Brand</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-7.5">
              {phoneBrands.map((brand) => (
                <div key={brand.name} onClick={() => setSelectedBrand(brand.name)} className={`border-[1.5px] rounded-[16px] p-[20px_8px_14px] text-center cursor-pointer transition-all hover:-translate-y-1 ${selectedBrand === brand.name ? 'border-[#7C3AED] bg-[#F3ECFF]' : 'border-[#EFE9FB]'}`}>
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Image src={brand.logo} alt={brand.name} width={40} height={40} className="object-contain" />
                  </div>
                  <div className="text-[0.82rem] font-semibold text-[#1E1B29]">{brand.name}</div>
                </div>
              ))}
              <div onClick={() => setShowMoreBrands(!showMoreBrands)} className={`border-[1.5px] rounded-[16px] p-[20px_8px_14px] text-center cursor-pointer transition-all hover:-translate-y-1 ${showMoreBrands ? 'border-[#7C3AED] bg-[#F3ECFF]' : 'border-[#EFE9FB]'}`}>
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-[#F3ECFF] text-[#5B21B6] flex items-center justify-center">
                  <span className="font-bold">...</span>
                </div>
                <div className="text-[0.82rem] font-semibold text-[#1E1B29]">More</div>
              </div>
            </div>
            
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${showMoreBrands ? 'max-h-[220px] opacity-100 mb-6.5' : 'max-h-0 opacity-0 mb-0'}`}>
              {moreBrands.map((brand) => (
                <div key={brand} onClick={() => setSelectedBrand(brand)} className={`border-[1.5px] rounded-xl px-2.5 py-3 text-center text-[0.84rem] font-semibold cursor-pointer ${selectedBrand === brand ? 'border-[#7C3AED] bg-[#5B21B6] text-white' : 'border-[#EFE9FB] text-[#1E1B29]'}`}>
                  {brand}
                </div>
              ))}
            </div>

            <button disabled={!selectedBrand} onClick={() => setStep(2)} className="w-full bg-[#5B21B6] text-white py-4.5 rounded-[16px] font-bold text-[1.02rem] disabled:bg-[#D8CDEF] cursor-pointer">
              Next: Device Details
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-[fade-in-up_0.3s_ease-out]">
            <button onClick={() => setStep(1)} className="text-[#6E6683] font-semibold text-[0.9rem] mb-5.5 hover:text-[#5B21B6]">← Back</button>
            <h2 className="text-[1.3rem] text-[#1E1B29] font-space font-bold mb-1.5">Assess your {selectedBrand}</h2>
            
            <form onSubmit={handleFinalSubmit} className="space-y-6 mt-6">
              
              <div>
                <label className="block text-[0.85rem] font-semibold text-[#1E1B29] mb-2">Exact Model Name</label>
                <input 
                  type="text" required 
                  value={modelName} onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. iPhone 13 Pro Max (128GB)" 
                  className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#E3D9F9] focus:border-[#7C3AED] outline-none" 
                />
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-[#1E1B29] mb-3">Does the device have any of these issues?</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-[1.5px] border-[#E3D9F9] rounded-xl cursor-pointer hover:bg-[#FAF7FF]">
                    <input type="checkbox" checked={conditions.screenDamaged} onChange={(e) => setConditions({...conditions, screenDamaged: e.target.checked})} className="w-5 h-5 accent-[#7C3AED]" />
                    <span className="text-[#1E1B29] text-[0.95rem]">Screen is cracked or has display issues</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-[1.5px] border-[#E3D9F9] rounded-xl cursor-pointer hover:bg-[#FAF7FF]">
                    <input type="checkbox" checked={conditions.bodyScratches} onChange={(e) => setConditions({...conditions, bodyScratches: e.target.checked})} className="w-5 h-5 accent-[#7C3AED]" />
                    <span className="text-[#1E1B29] text-[0.95rem]">Heavy dents or scratches on the body</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[0.85rem] font-semibold text-[#1E1B29] mb-2">Upload Device Photo (Optional)</label>
                <div className="border-2 border-dashed border-[#E3D9F9] rounded-xl p-6 text-center hover:bg-[#FAF7FF] transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  {imageBase64 ? (
                    <div className="flex flex-col items-center">
                      <img src={imageBase64} alt="Preview" className="h-24 object-contain mb-2 rounded-md shadow-sm" />
                      <span className="text-[0.8rem] text-[#7C3AED] font-semibold">Image captured securely! Click to change.</span>
                    </div>
                  ) : (
                    <div className="text-[#6E6683] text-[0.9rem]">
                      <span className="text-[#7C3AED] font-semibold">Tap to upload</span> or snap a picture of your phone
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#5B21B6] text-white py-4.5 rounded-[16px] font-bold text-[1.02rem] mt-4 hover:bg-[#3D1E7A] disabled:bg-[#D8CDEF]">
                {isSubmitting ? "Processing..." : "Calculate Best Price"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}