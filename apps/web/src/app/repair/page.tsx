'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { getRepairDeviceModels } from '@/app/actions/repairEngine';

type RepairStep = 1 | 2 | 3 | 4 | 5 | 6;

const SERVICES = [
  { id: 'screen', title: 'Screen Replacement', description: 'Cracked or non-responsive display', icon: '📱' },
  { id: 'battery', title: 'Battery Replacement', description: 'Quick draining, swelling, or low health', icon: '🔋' },
  { id: 'mic', title: 'Microphone & Speaker Repair', description: 'Muffled sound, mic not catching audio', icon: '🎙️' },
  { id: 'motherboard', title: 'Motherboard Inspection', description: 'No power, water damage, or complex chip issues', icon: '⚙️' },
  { id: 'cleaning', title: 'Deep Device Cleaning', description: 'Port lint clearing, speaker grill cleaning', icon: '✨' },
];

const sellCategories = [
  { name: 'Smartphones', sub: 'Apple, Samsung, OnePlus & more', image: 'https://ik.imagekit.io/e8vtmc5nh/Picsart_26-07-30_21-18-32-076.png', category: 'Smartphones' },
  { name: 'Laptops', sub: 'Dell, HP, Lenovo, ASUS & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_000000003aa481fa8a4ae4415b099d49.png', category: 'Laptops' },
  { name: 'Tablets', sub: 'iPad, Galaxy Tab, Xiaomi & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_00000000bfcc820b9ec8f0cc9e0379d8.png', category: 'Tablets' },
  { name: 'Mac devices', sub: 'MacBook, iMac, Mac mini & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_0000000026b8820b9d8f884d7d0d3bf5.png', category: 'Mac' },
];

const POPULAR_BRANDS: Record<string, { name: string; logo?: string }[]> = {
  Smartphones: [
    { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple' },
    { name: 'Samsung', logo: 'https://cdn.simpleicons.org/samsung' },
    { name: 'Google', logo: 'https://cdn.simpleicons.org/google' },
    { name: 'OnePlus', logo: 'https://cdn.simpleicons.org/oneplus' },
    { name: 'Xiaomi', logo: 'https://cdn.simpleicons.org/xiaomi' },
    { name: 'Oppo', logo: 'https://cdn.simpleicons.org/oppo' },
    { name: 'Vivo', logo: 'https://cdn.simpleicons.org/vivo' },
    { name: 'Realme', logo: '/brands/realme.svg' },
    { name: 'Motorola', logo: 'https://cdn.simpleicons.org/motorola' },
    { name: 'Nothing', logo: '/brands/nothing.svg' },
    { name: 'Other brand' },
  ],
  Laptops: [
    { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple' },
    { name: 'Dell', logo: 'https://cdn.simpleicons.org/dell' },
    { name: 'HP', logo: 'https://cdn.simpleicons.org/hp' },
    { name: 'Lenovo', logo: 'https://cdn.simpleicons.org/lenovo' },
    { name: 'ASUS', logo: 'https://cdn.simpleicons.org/asus' },
    { name: 'Acer', logo: 'https://cdn.simpleicons.org/acer' },
    { name: 'MSI', logo: 'https://cdn.simpleicons.org/msi' },
    { name: 'Other brand' },
  ],
  Tablets: [
    { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple' },
    { name: 'Samsung', logo: 'https://cdn.simpleicons.org/samsung' },
    { name: 'Lenovo', logo: 'https://cdn.simpleicons.org/lenovo' },
    { name: 'Xiaomi', logo: 'https://cdn.simpleicons.org/xiaomi' },
    { name: 'Realme', logo: '/brands/realme.svg' },
    { name: 'Other brand' },
  ],
  Mac: [
    { name: 'MacBook Air', logo: 'https://cdn.simpleicons.org/apple' },
    { name: 'MacBook Pro', logo: 'https://cdn.simpleicons.org/apple' },
    { name: 'iMac', logo: 'https://cdn.simpleicons.org/apple' },
    { name: 'Mac mini', logo: 'https://cdn.simpleicons.org/apple' },
    { name: 'Other brand' },
  ],
};

const UPSELLS = [
  { id: 'cleaning', label: 'Mobile Cleaning & Sanitization', price: 199, description: 'Antibacterial deep clean + port dusting' },
  { id: 'screen_guard', label: 'Premium Tempered Glass', price: 299, description: '9H hardness scratch protection' },
  { id: 'charger_cable', label: 'Reinforced Type-C Cable (1m)', price: 399, description: 'Fast charging, braided nylon durability' },
];

export default function RepairPage() {
  const [step, setStep] = useState<RepairStep>(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form states
  const [selectedService, setSelectedService] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [modelsList, setModelsList] = useState<{ model: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [showAllBrands, setShowAllBrands] = useState<boolean>(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setCustomerInfo((prev) => ({
          ...prev,
          name: prev.name || user.displayName || '',
        }));
      }
    });
    return () => unsubscribe();
  }, []);

function getFallbackRepairModels(category: string, brand: string): string[] {
  const catLower = category.toLowerCase();
  const brandLower = brand.toLowerCase();

  if (catLower.includes('phone') || catLower.includes('smart') || catLower.includes('mobile')) {
    if (brandLower.includes('apple')) {
      return [
        'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
        'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
        'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
        'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
        'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
        'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS Max', 'iPhone SE (3rd Gen)'
      ];
    }
    if (brandLower.includes('samsung')) {
      return [
        'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
        'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
        'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
        'Galaxy S21 Ultra', 'Galaxy S21', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5',
        'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy M54', 'Galaxy F54'
      ];
    }
    if (brandLower.includes('google')) {
      return [
        'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
        'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
        'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
        'Pixel 5', 'Pixel 4a 5G', 'Pixel 4'
      ];
    }
    if (brandLower.includes('oneplus')) {
      return [
        'OnePlus 12', 'OnePlus 12R', 'OnePlus 11', 'OnePlus 11R',
        'OnePlus 10 Pro', 'OnePlus 10R', 'OnePlus 9 Pro', 'OnePlus 9R',
        'OnePlus Nord 3', 'OnePlus Nord CE 3 Lite', 'OnePlus Open'
      ];
    }
    if (brandLower.includes('xiaomi') || brandLower.includes('redmi')) {
      return [
        'Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13 Pro', 'Xiaomi 13T Pro',
        'Redmi Note 13 Pro+ 5G', 'Redmi Note 13 Pro', 'Redmi Note 12 Pro',
        'POCO F5 Pro', 'POCO X6 Pro'
      ];
    }
    if (brandLower.includes('oppo')) {
      return [
        'Find X6 Pro', 'Find N3 Flip', 'Reno 11 Pro 5G', 'Reno 10 Pro+',
        'Reno 8 Pro', 'Oppo F25 Pro', 'Oppo A79'
      ];
    }
    if (brandLower.includes('vivo')) {
      return [
        'X100 Pro', 'X90 Pro', 'V30 Pro', 'V29 Pro',
        'V27 Pro', 'T2 Pro 5G', 'Vivo Y200'
      ];
    }
    if (brandLower.includes('realme')) {
      return [
        'Realme GT 5', 'Realme 12 Pro+ 5G', 'Realme 12 Pro',
        'Realme 11 Pro+', 'Realme 10 Pro', 'Realme Narzo 60 Pro'
      ];
    }
    if (brandLower.includes('motorola')) {
      return [
        'Edge 50 Pro', 'Edge 40 Neo', 'Edge 40',
        'Razr 40 Ultra', 'Razr 40', 'Moto G84 5G', 'Moto G54'
      ];
    }
    if (brandLower.includes('nothing')) {
      return [
        'Phone (2)', 'Phone (2a)', 'Phone (1)'
      ];
    }
    return [
      `${brand} Pro Max`, `${brand} Ultra`, `${brand} Note`, `${brand} Lite`
    ];
  }

  if (catLower.includes('laptop')) {
    if (brandLower.includes('dell')) {
      return ['XPS 15', 'XPS 13 Plus', 'Inspiron 16', 'Inspiron 15', 'Vostro 15', 'Latitude 5440', 'G15 Gaming'];
    }
    if (brandLower.includes('hp')) {
      return ['Spectre x360', 'Envy x360', 'Pavilion 15', 'HP 15s', 'Victus 16', 'Omen 16', 'EliteBook 840'];
    }
    if (brandLower.includes('lenovo')) {
      return ['ThinkPad X1 Carbon', 'Yoga 9i', 'IdeaPad Slim 5', 'Legion Pro 5', 'LOQ 15', 'ThinkBook 15'];
    }
    if (brandLower.includes('asus')) {
      return ['Zenbook 14 OLED', 'Vivobook 15', 'ROG Zephyrus G14', 'ROG Strix G16', 'TUF Gaming F15'];
    }
    if (brandLower.includes('acer')) {
      return ['Swift Go 14', 'Aspire 5', 'Nitro 5', 'Predator Helios 16', 'TravelMate'];
    }
    if (brandLower.includes('msi')) {
      return ['Modern 15', 'Prestige 14', 'Katana 15', 'Cyborg 15', 'Stealth 16 Studio'];
    }
    return [
      `${brand} Series 15`, `${brand} Ultra Thin`, `${brand} Pro Notebook`
    ];
  }

  if (catLower.includes('tablet')) {
    if (brandLower.includes('apple')) {
      return ['iPad Pro 12.9 (M2)', 'iPad Pro 11 (M2)', 'iPad Air (M1)', 'iPad (10th Gen)', 'iPad mini (6th Gen)'];
    }
    if (brandLower.includes('samsung')) {
      return ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9 FE', 'Galaxy Tab A9+', 'Galaxy Tab S8 Ultra'];
    }
    if (brandLower.includes('lenovo')) {
      return ['Tab P12', 'Tab M10 Plus (3rd Gen)', 'Yoga Tab 11', 'Tab P11 Pro'];
    }
    if (brandLower.includes('xiaomi')) {
      return ['Xiaomi Pad 6', 'Redmi Pad SE', 'Xiaomi Pad 5'];
    }
    if (brandLower.includes('realme')) {
      return ['Realme Pad 2', 'Realme Pad X', 'Realme Pad mini'];
    }
    return [
      `${brand} Pro Tablet`, `${brand} Lite Tab`, `${brand} Air Pad`
    ];
  }

  if (catLower.includes('mac')) {
    if (brandLower.includes('air')) {
      return ['MacBook Air M3 (2024)', 'MacBook Air M2 (2022)', 'MacBook Air M1 (2020)'];
    }
    if (brandLower.includes('pro')) {
      return ['MacBook Pro M3 Max (2024)', 'MacBook Pro M2 Pro (2023)', 'MacBook Pro M1 Pro (2021)'];
    }
    if (brandLower.includes('imac')) {
      return ['iMac M3 (2023)', 'iMac M1 (2021)'];
    }
    if (brandLower.includes('mini')) {
      return ['Mac mini M2 Pro (2023)', 'Mac mini M2 (2023)', 'Mac mini M1 (2020)'];
    }
    return ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Air M2', 'MacBook Air M1'];
  }

  return [];
}

  // Fetch exact retail names after the customer chooses a category and brand.
  useEffect(() => {
    if (!brand || !category || brand === 'Other brand') {
      setModelsList([]);
      return;
    }

    let isCurrentRequest = true;
    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        setModelsList([]);
        const data = await getRepairDeviceModels(category, brand);
        if (isCurrentRequest) {
          if (Array.isArray(data) && data.length > 0) {
            setModelsList(data.map((model) => ({ model })));
          } else {
            // Load beautiful local models list if API is rate-limited / quota exhausted
            const fallback = getFallbackRepairModels(category, brand);
            setModelsList(fallback.map((model) => ({ model })));
          }
        }
      } catch (err) {
        console.error('Failed to load models:', err);
        if (isCurrentRequest) {
          const fallback = getFallbackRepairModels(category, brand);
          setModelsList(fallback.map((model) => ({ model })));
        }
      } finally {
        if (isCurrentRequest) setLoadingModels(false);
      }
    };

    fetchModels();
    return () => {
      isCurrentRequest = false;
    };
  }, [category, brand]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep(2);
  };

  const toggleUpsell = (upsellId: string) => {
    setSelectedUpsells((prev) =>
      prev.includes(upsellId) ? prev.filter((id) => id !== upsellId) : [...prev, upsellId]
    );
  };

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setCurrentUser(result.user);
      setCustomerInfo((prev) => ({
        ...prev,
        name: result.user.displayName || '',
      }));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Google sign-in could not be completed. Please try again.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setLoading(true);
    setError('');

    try {
      // 1. Create/update a user record if needed
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          name: customerInfo.name,
          phone: customerInfo.phone,
          whatsappNumber: customerInfo.whatsappNumber,
          address: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          pincode: customerInfo.pincode,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.warn('Non-blocking user save error:', err);
      }

      // 2. Map selected upsells info
      const addons = UPSELLS.filter((u) => selectedUpsells.includes(u.id)).map((u) => ({
        id: u.id,
        label: u.label,
        price: u.price,
      }));

      // 3. Write payload to repair_requests collection
      const orderPayload = {
        userId: currentUser.uid,
        service: SERVICES.find((s) => s.id === selectedService)?.title || selectedService,
        category,
        brand,
        model: modelName,
        addons,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerWhatsapp: customerInfo.whatsappNumber,
        customerAddress: customerInfo.address,
        customerCity: customerInfo.city,
        customerState: customerInfo.state,
        customerPincode: customerInfo.pincode,
        status: 'pending_pickup',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'repair_requests'), orderPayload);
      setSuccessId(docRef.id);
    } catch (err) {
      console.error('Failed to create repair order:', err);
      setError('Could not place your order. Please verify your fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActiveService = () => SERVICES.find((s) => s.id === selectedService);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Page Header */}
      <div className="text-center mb-8">
        <span className="text-sm font-bold uppercase tracking-wider text-[#7C3AED] bg-[#F3ECFF] px-3 py-1 rounded-full">
          Selltronics Repairs
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E1B29] mt-3">
          Premium Doorstep Device Repair
        </h1>
        <p className="text-[#6E6683] mt-2 max-w-xl mx-auto">
          High-quality parts, certified technicians, and a transparent warranty. We repair at your home or office.
        </p>
      </div>

      {/* Step Indicator */}
      {!successId && (
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 text-sm font-semibold">
          {[
            { s: 1, label: 'Service' },
            { s: 2, label: 'Category' },
            { s: 3, label: 'Brand' },
            { s: 4, label: 'Model' },
            { s: 5, label: 'Upsell' },
            { s: 6, label: 'Booking' },
          ].map((item) => (
            <div key={item.s} className="flex items-center">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs ${
                  step === item.s
                    ? 'bg-[#5B21B6] border-[#5B21B6] text-white'
                    : step > item.s
                    ? 'bg-[#E3D9F9] border-[#E3D9F9] text-[#5B21B6]'
                    : 'bg-white border-[#E3D9F9] text-[#6E6683]'
                }`}
              >
                {item.s}
              </span>
              <span
                className={`hidden sm:inline ml-2 ${
                  step === item.s ? 'text-[#1E1B29] font-bold' : 'text-[#6E6683]'
                }`}
              >
                {item.label}
              </span>
              {item.s < 6 && <span className="text-[#E3D9F9] mx-2">➔</span>}
            </div>
          ))}
        </div>
      )}

      {/* Main Form Body */}
      {successId ? (
        <section className="bg-white border border-[#E3D9F9] rounded-3xl p-8 text-center shadow-lg animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E1B29]">Repair Request Placed!</h2>
          <p className="text-[#6E6683] mt-2 max-w-md mx-auto">
            Your booking request has been successfully received. A service representative will contact you shortly to schedule the service visit.
          </p>
          <div className="bg-[#FAF7FF] border border-[#F0EAFB] rounded-2xl p-4 my-6 inline-block font-mono text-sm text-[#5B21B6]">
            Order Reference ID: {successId}
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setSuccessId(null);
                setStep(1);
                setSelectedService('');
                setCategory('');
                setBrand('');
                setModelName('');
                setSelectedUpsells([]);
              }}
              className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-full font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Book Another Repair
            </button>
            <a
              href="/profile"
              className="px-6 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer"
            >
              View My Orders
            </a>
          </div>
        </section>
      ) : (
        <div className="bg-white border border-[#E3D9F9] rounded-3xl p-6 md:p-8 shadow-sm">
          {/* STEP 1: SERVICE GRID */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#1E1B29] mb-4">What service do you need?</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {SERVICES.map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => handleServiceSelect(srv.id)}
                    className="flex items-start gap-4 p-5 text-left border border-[#E3D9F9] hover:border-[#7C3AED] rounded-2xl bg-white hover:bg-[#FAF7FF] transition-all group duration-200 cursor-pointer shadow-sm animate-fade-in"
                  >
                    <span className="text-3xl p-2 bg-[#F3ECFF] rounded-xl group-hover:scale-110 transition-transform">
                      {srv.icon}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-[#1E1B29] group-hover:text-[#5B21B6] transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-sm text-[#6E6683] mt-1">{srv.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY SELECTION - MATCHING THE MAIN PAGE */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between border-b border-[#F0EAFB] pb-3 mb-6">
                <h2 className="text-xl font-bold text-[#1E1B29]">Select Device Category</h2>
                <span className="text-sm font-bold text-[#7C3AED] bg-[#F3ECFF] px-2.5 py-1 rounded-md">
                  {getActiveService()?.title}
                </span>
              </div>
              
              <div className="device-grid-home" style={{ marginTop: 24 }}>
                {sellCategories.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setCategory(item.category);
                      setBrand('');
                      setModelName('');
                      setModelsList([]);
                      setShowManualInput(false);
                      setStep(3); // Go directly to Brand step
                    }}
                    className="device-category"
                    style={{
                      textAlign: 'left',
                      width: '100%',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ink)' }}>{item.name}</h3>
                      <p>{item.sub}</p>
                    </div>
                    <span className="device-arrow" style={{ display: 'grid', placeItems: 'center' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                    <div className="device-drawing">
                      <img src={item.image} alt={item.name} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 border-t border-[#F0EAFB] pt-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BRAND SELECTION - MATCHING THE LOGO GRID */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between border-b border-[#F0EAFB] pb-3 mb-6">
                <h2 className="text-xl font-bold text-[#1E1B29]">Select Device Brand</h2>
                <span className="text-sm font-bold text-[#7C3AED] bg-[#F3ECFF] px-2.5 py-1 rounded-md">
                  {category} · {getActiveService()?.title}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: 10, marginTop: 24 }}>
                {(() => {
                  const allBrands = POPULAR_BRANDS[category] || [];
                  const visibleBrands = showAllBrands ? allBrands : allBrands.slice(0, 3);
                  return visibleBrands.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setBrand(item.name);
                        setModelName('');
                        setModelsList([]);
                        setShowManualInput(item.name === 'Other brand');
                        setStep(4);
                      }}
                      style={{
                        minHeight: 74,
                        padding: '10px 9px',
                        border: '1px solid #E3D9F9',
                        borderRadius: 12,
                        background: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        gap: 6,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '2px solid var(--violet-700)';
                        e.currentTarget.style.background = 'var(--lavender-100)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '1px solid #E3D9F9';
                        e.currentTarget.style.background = '#fff';
                      }}
                    >
                      {item.logo ? (
                        <img src={item.logo} alt="" width="24" height="24" />
                      ) : (
                        <b>{item.name.slice(0, 2).toUpperCase()}</b>
                      )}
                      <span style={{ margin: 0 }}>{item.name}</span>
                    </button>
                  ));
                })()}
              </div>

              {/* Show More Brands toggle */}
              {!showAllBrands && (POPULAR_BRANDS[category] || []).length > 3 && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllBrands(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F3ECFF] hover:bg-[#E3D9F9] text-[#5B21B6] rounded-full font-bold text-sm transition-all cursor-pointer"
                  >
                    + More Brands
                  </button>
                </div>
              )}
              {showAllBrands && (POPULAR_BRANDS[category] || []).length > 3 && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllBrands(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[#6E6683] hover:text-[#5B21B6] rounded-full font-bold text-sm transition-all cursor-pointer"
                  >
                    Show Less
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 border-t border-[#F0EAFB] pt-5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MODEL SELECTION - CLICKABLE CARDS AND MANUAL FALLBACK */}
          {step === 4 && (
            <div>
              <div className="flex items-center justify-between border-b border-[#F0EAFB] pb-3 mb-6">
                <h2 className="text-xl font-bold text-[#1E1B29]">Select Device Model</h2>
                <span className="text-sm font-bold text-[#7C3AED] bg-[#F3ECFF] px-2.5 py-1 rounded-md">
                  {brand} · {getActiveService()?.title}
                </span>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                {loadingModels ? (
                  <div className="text-center py-8">
                    <span className="text-[#7C3AED] font-bold animate-pulse">Finding compatible models...</span>
                  </div>
                ) : !showManualInput ? (
                  <div>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {modelsList.map((item) => (
                        <button
                          key={item.model}
                          type="button"
                          onClick={() => {
                            setModelName(item.model);
                          }}
                          style={{
                            padding: '16px',
                            border: modelName === item.model ? '2px solid var(--violet-700)' : '1px solid #E3D9F9',
                            borderRadius: 12,
                            background: modelName === item.model ? 'var(--lavender-100)' : '#fff',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: 'var(--ink)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{item.model}</span>
                          {modelName === item.model && <span style={{ color: 'var(--violet-700)' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                    {modelsList.length === 0 && (
                      <p className="text-center text-sm text-[#6E6683] py-4">
                        No matching models were found. You can enter your device model below.
                      </p>
                    )}
                    
                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowManualInput(true);
                          setModelName('');
                        }}
                        className="text-sm font-bold text-[#7C3AED] hover:underline cursor-pointer"
                      >
                        My device is not listed
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="field">
                      <span>Enter custom device model</span>
                      <input
                        type="text"
                        placeholder="e.g. iPhone 13 Pro Max"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        required
                        style={{ width: '100%', marginTop: 8 }}
                      />
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowManualInput(false);
                          setModelName('');
                        }}
                        className="text-sm font-bold text-[#7C3AED] hover:underline cursor-pointer"
                      >
                        Show popular models list
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 border-t border-[#F0EAFB] pt-5">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={!brand || !modelName}
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: UPSELL & ADD-ONS */}
          {step === 5 && (
            <div>
              <div className="flex items-center justify-between border-b border-[#F0EAFB] pb-3 mb-6">
                <h2 className="text-xl font-bold text-[#1E1B29]">Frequently Added Together</h2>
                <span className="text-sm font-semibold text-[#6E6683]">
                  Optional add-ons for your {brand} {modelName}
                </span>
              </div>

              <div className="space-y-4">
                {UPSELLS.map((item) => {
                  const isChecked = selectedUpsells.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                        isChecked
                          ? 'border-[#7C3AED] bg-[#FAF7FF]'
                          : 'border-[#E3D9F9] hover:bg-[#FAF7FF]/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleUpsell(item.id)}
                        className="mt-1 h-5 w-5 rounded border-[#D8C8F6] text-[#7C3AED] focus:ring-[#7C3AED]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#1E1B29]">{item.label}</span>
                          <span className="font-bold text-[#7C3AED]">+ Rs. {item.price}</span>
                        </div>
                        <p className="text-sm text-[#6E6683] mt-1">{item.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 border-t border-[#F0EAFB] pt-5">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-full font-bold transition-all shadow-md cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: AUTH & BOOKING DETAILS */}
          {step === 6 && (
            <div>
              <h2 className="text-xl font-bold text-[#1E1B29] border-b border-[#F0EAFB] pb-3 mb-6">
                Booking Information
              </h2>

              {!currentUser ? (
                <div className="text-center py-10 px-4 bg-[#FAF7FF] border border-[#E3D9F9] rounded-2xl animate-fade-in">
                  <h3 className="font-bold text-lg text-[#1E1B29] mb-2">Please Authenticate to Book</h3>
                  <p className="text-sm text-[#6E6683] max-w-sm mx-auto mb-6">
                    Sign in with Google securely to keep track of your order progress and receive status updates.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-full font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                  {error && <p className="text-red-500 font-medium text-sm mt-4">{error}</p>}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-5 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder} className="space-y-4 animate-fade-in">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-[#1E1B29] mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                        className="border border-[#E3D9F9] rounded-xl p-3 outline-none focus:border-[#7C3AED] text-[#1E1B29] font-medium"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-[#1E1B29] mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                        className="border border-[#E3D9F9] rounded-xl p-3 outline-none focus:border-[#7C3AED] text-[#1E1B29] font-medium"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-[#1E1B29] mb-1">WhatsApp Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp number for booking updates"
                        value={customerInfo.whatsappNumber}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                        className="border border-[#E3D9F9] rounded-xl p-3 outline-none focus:border-[#7C3AED] text-[#1E1B29] font-medium"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-[#1E1B29] mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        placeholder="6-digit PIN code"
                        value={customerInfo.pincode}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, pincode: e.target.value }))}
                        className="border border-[#E3D9F9] rounded-xl p-3 outline-none focus:border-[#7C3AED] text-[#1E1B29] font-medium"
                      />
                    </div>

                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-bold text-[#1E1B29] mb-1">Doorstep Service Address</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat, House No, Building, Street, Area"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                        className="border border-[#E3D9F9] rounded-xl p-3 outline-none focus:border-[#7C3AED] text-[#1E1B29] font-medium"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-[#1E1B29] mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, city: e.target.value }))}
                        className="border border-[#E3D9F9] rounded-xl p-3 outline-none focus:border-[#7C3AED] text-[#1E1B29] font-medium"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-[#1E1B29] mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.state}
                        onChange={(e) => setCustomerInfo((prev) => ({ ...prev, state: e.target.value }))}
                        className="border border-[#E3D9F9] rounded-xl p-3 outline-none focus:border-[#7C3AED] text-[#1E1B29] font-medium"
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-500 font-medium text-sm mt-4">{error}</p>}

                  {/* Summary of what they're booking */}
                  <div className="bg-[#FAF7FF] border border-[#E3D9F9] rounded-2xl p-4 mt-6">
                    <span className="text-xs font-bold text-[#7C3AED] tracking-wider uppercase block">
                      Booking Summary
                    </span>
                    <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
                      <div>
                        <strong className="text-[#1E1B29]">
                          {getActiveService()?.title}
                        </strong>{' '}
                        for <span className="text-[#6E6683]">{brand} {modelName}</span>
                      </div>
                      {selectedUpsells.length > 0 && (
                        <div className="text-xs text-[#5B21B6] font-semibold">
                          + {selectedUpsells.length} Add-on{selectedUpsells.length > 1 ? 's' : ''} Selected
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 border-t border-[#F0EAFB] pt-5">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="px-5 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-full font-bold shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Confirming Booking...' : 'Request Doorstep Repair'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
