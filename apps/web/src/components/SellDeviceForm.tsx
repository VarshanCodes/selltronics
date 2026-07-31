'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';

type DeviceType = 'Smartphones' | 'Laptops' | 'Tablets' | 'Mac' | 'Other devices';
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Brand = { name: string; logo?: string; mark?: string };
type CategoryCopy = {
  eyebrow: string;
  title: string;
  description: string;
  brandLabel: string;
  modelLabel: string;
  modelPlaceholder: string;
  storageOptions: string[];
  ramOptions: string[];
  specLabel: string;
  specPlaceholder: string;
  brands: Brand[];
};

const benefits = ['Secure process', 'Free pickup', 'Instant payment', 'Certified data wipe', 'Same-day payment'];

const brand = (name: string, logo?: string, mark?: string): Brand => ({ name, logo, mark: mark || name.slice(0, 2).toUpperCase() });

const categoryCopy: Record<DeviceType, CategoryCopy> = {
  Smartphones: {
    eyebrow: 'Selltronics',
    title: 'Sell Old Mobile Phones Online',
    description: 'Sell your old or used mobile phone online for the best price with Selltronics. Get instant cash, free doorstep pickup near you, and a quick, secure selling process - with no hidden fees.',
    brandLabel: 'Choose the brand',
    modelLabel: 'Phone model name',
    modelPlaceholder: 'e.g. iPhone 13 Pro Max',
    storageOptions: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Not sure'],
    ramOptions: ['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB', 'Not sure'],
    specLabel: 'Variant or extra detail',
    specPlaceholder: 'e.g. 5G, dual SIM, color',
    brands: [
      brand('Apple', 'https://cdn.simpleicons.org/apple'),
      brand('Samsung', 'https://cdn.simpleicons.org/samsung'),
      brand('Google', 'https://cdn.simpleicons.org/google'),
      brand('OnePlus', 'https://cdn.simpleicons.org/oneplus'),
      brand('Xiaomi', 'https://cdn.simpleicons.org/xiaomi'),
      brand('Redmi', undefined, 'MI'),
      brand('POCO', undefined, 'PO'),
      brand('Vivo', 'https://cdn.simpleicons.org/vivo'),
      brand('Oppo', 'https://cdn.simpleicons.org/oppo'),
      brand('Realme', '/brands/realme.svg'),
      brand('Motorola', 'https://cdn.simpleicons.org/motorola'),
      brand('Nothing', '/brands/nothing.svg'),
      brand('Nokia', 'https://cdn.simpleicons.org/nokia'),
      brand('Infinix', undefined, 'IN'),
      brand('Tecno', undefined, 'TE'),
      brand('Honor', 'https://cdn.simpleicons.org/honor'),
      brand('iQOO', undefined, 'IQ'),
      brand('ASUS', 'https://cdn.simpleicons.org/asus'),
      brand('Sony', '/brands/sony.svg'),
      brand('LG', 'https://cdn.simpleicons.org/lg'),
      brand('Other', undefined, '+'),
    ],
  },
  Laptops: {
    eyebrow: 'Selltronics',
    title: 'Sell Old Laptops Online',
    description: 'Sell your old or used laptop online for the best price with Selltronics. Get instant cash, free doorstep pickup near you, and a quick, secure selling process - with no hidden fees.',
    brandLabel: 'Choose the brand',
    modelLabel: 'Laptop model name',
    modelPlaceholder: 'e.g. Dell XPS 15',
    storageOptions: ['128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD', 'HDD storage', 'Not sure'],
    ramOptions: ['4 GB', '8 GB', '16 GB', '24 GB', '32 GB', '64 GB', 'Not sure'],
    specLabel: 'Processor / generation',
    specPlaceholder: 'e.g. Intel i5 12th Gen, Ryzen 7, M2',
    brands: [
      brand('Apple', 'https://cdn.simpleicons.org/apple'),
      brand('Dell', 'https://cdn.simpleicons.org/dell'),
      brand('HP', 'https://cdn.simpleicons.org/hp'),
      brand('Lenovo', 'https://cdn.simpleicons.org/lenovo'),
      brand('ASUS', 'https://cdn.simpleicons.org/asus'),
      brand('Acer', 'https://cdn.simpleicons.org/acer'),
      brand('Microsoft', '/brands/microsoft.svg'),
      brand('MSI', 'https://cdn.simpleicons.org/msi'),
      brand('Alienware', 'https://cdn.simpleicons.org/alienware'),
      brand('Razer', 'https://cdn.simpleicons.org/razer'),
      brand('LG', 'https://cdn.simpleicons.org/lg'),
      brand('Samsung', 'https://cdn.simpleicons.org/samsung'),
      brand('Toshiba', undefined, 'TO'),
      brand('VAIO', undefined, 'VA'),
      brand('Huawei', 'https://cdn.simpleicons.org/huawei'),
      brand('Honor', 'https://cdn.simpleicons.org/honor'),
      brand('Other', undefined, '+'),
    ],
  },
  Tablets: {
    eyebrow: 'Selltronics',
    title: 'Sell Old Tablets Online',
    description: 'Sell your old or used tablet online for the best price with Selltronics. Get instant cash, free doorstep pickup near you, and a quick, secure selling process - with no hidden fees.',
    brandLabel: 'Choose the brand',
    modelLabel: 'Tablet model name',
    modelPlaceholder: 'e.g. iPad Air 5th Gen',
    storageOptions: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Not sure'],
    ramOptions: ['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB', 'Not sure'],
    specLabel: 'Connectivity / extra detail',
    specPlaceholder: 'e.g. WiFi only, WiFi + Cellular, color',
    brands: [
      brand('Apple', 'https://cdn.simpleicons.org/apple'),
      brand('Samsung', 'https://cdn.simpleicons.org/samsung'),
      brand('Lenovo', 'https://cdn.simpleicons.org/lenovo'),
      brand('Xiaomi', 'https://cdn.simpleicons.org/xiaomi'),
      brand('OnePlus', 'https://cdn.simpleicons.org/oneplus'),
      brand('Realme', '/brands/realme.svg'),
      brand('Oppo', 'https://cdn.simpleicons.org/oppo'),
      brand('Vivo', 'https://cdn.simpleicons.org/vivo'),
      brand('Honor', 'https://cdn.simpleicons.org/honor'),
      brand('Huawei', 'https://cdn.simpleicons.org/huawei'),
      brand('Microsoft', '/brands/microsoft.svg'),
      brand('Nokia', 'https://cdn.simpleicons.org/nokia'),
      brand('Amazon', '/brands/amazon.svg'),
      brand('Other', undefined, '+'),
    ],
  },
  Mac: {
    eyebrow: 'Selltronics',
    title: 'Sell Your Mac Online',
    description: 'Sell your old or used iMac, MacBook, Mac Mini or Mac Studio online for the best price with Selltronics. Get instant cash, free doorstep pickup near you, and a quick, secure selling process - with no hidden fees.',
    brandLabel: 'Choose Mac device',
    modelLabel: 'Mac model name',
    modelPlaceholder: 'e.g. MacBook Air M2 2022',
    storageOptions: ['128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD', '4 TB SSD', '8 TB SSD', 'Not sure'],
    ramOptions: ['8 GB', '16 GB', '24 GB', '32 GB', '64 GB', '96 GB', '128 GB', 'Not sure'],
    specLabel: 'Chip / year',
    specPlaceholder: 'e.g. M1, M2 Pro, Intel i7, 2020',
    brands: [
      brand('MacBook Air', 'https://cdn.simpleicons.org/apple'),
      brand('MacBook Pro', 'https://cdn.simpleicons.org/apple'),
      brand('iMac', 'https://cdn.simpleicons.org/apple'),
      brand('Mac mini', 'https://cdn.simpleicons.org/apple'),
      brand('Mac Studio', 'https://cdn.simpleicons.org/apple'),
      brand('Mac Pro', 'https://cdn.simpleicons.org/apple'),
    ],
  },
  'Other devices': {
    eyebrow: 'Selltronics',
    title: 'Sell Other Devices Online',
    description: 'Sell your used smartwatch, gaming console, camera, audio device or accessory online with Selltronics. Get secure pickup, quick review, and transparent payment after inspection.',
    brandLabel: 'Choose the brand',
    modelLabel: 'Device model name',
    modelPlaceholder: 'e.g. Apple Watch Series 8, PS5, GoPro Hero',
    storageOptions: ['No storage', '16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Not sure'],
    ramOptions: ['Not applicable', '2 GB', '4 GB', '8 GB', '16 GB', 'Not sure'],
    specLabel: 'Device type / extra detail',
    specPlaceholder: 'e.g. smartwatch, console, camera, headphones',
    brands: [
      brand('Apple', 'https://cdn.simpleicons.org/apple'),
      brand('Samsung', 'https://cdn.simpleicons.org/samsung'),
      brand('Sony', '/brands/sony.svg'),
      brand('Nintendo', '/brands/nintendo.svg'),
      brand('Microsoft', '/brands/microsoft.svg'),
      brand('Garmin', 'https://cdn.simpleicons.org/garmin'),
      brand('GoPro', '/brands/gopro.svg'),
      brand('Canon', '/brands/canon.svg'),
      brand('Nikon', 'https://cdn.simpleicons.org/nikon'),
      brand('Bose', 'https://cdn.simpleicons.org/bose'),
      brand('JBL', 'https://cdn.simpleicons.org/jbl'),
      brand('Other', undefined, '+'),
    ],
  },
};

const categoryAliases: Record<string, DeviceType> = {
  Smartphone: 'Smartphones',
  Smartphones: 'Smartphones',
  Mobile: 'Smartphones',
  'Mobile Phones': 'Smartphones',
  Laptops: 'Laptops',
  Laptop: 'Laptops',
  Tablets: 'Tablets',
  Tablet: 'Tablets',
  Mac: 'Mac',
  'Mac devices': 'Mac',
  'Other devices': 'Other devices',
  Other: 'Other devices',
};

const mobileQuestions = [
  ['canMakeCalls', 'Are you able to make and receive calls?', 'Check your device for cellular network connectivity issues.'],
  ['touchWorking', "Is your device's touch screen working properly?", 'Check the touch screen functionality of your phone.'],
  ['screenOriginal', "Is your phone's screen original?", 'Choose Yes if it was never changed or changed by an authorised service centre.'],
  ['underWarranty', 'Is your device under manufacturer warranty?', 'A valid bill can help you get a better price.'],
  ['hasGstBill', 'Do you have a GST valid bill with the same IMEI?', 'Make sure your bill has the device IMEI mentioned on it.'],
] as const;

const questionsByCategory: Record<DeviceType, readonly (readonly [string, string, string])[]> = {
  Smartphones: mobileQuestions,
  Tablets: mobileQuestions.map(([key, title, hint]) => [key, title.replace('phone', 'tablet'), hint.replace('phone', 'tablet')]) as readonly (readonly [string, string, string])[],
  Laptops: [
    ['powersOn', 'Is your laptop powering on properly?', 'Check if the laptop starts and stays on without sudden shutdowns.'],
    ['displayWorking', "Is your laptop's screen working properly?", 'Check for display, brightness, flicker, dead pixel, or line issues.'],
    ['keyboardTrackpadWorking', 'Are the keyboard and trackpad working properly?', 'Choose No if keys, trackpad, or click actions are faulty.'],
    ['underWarranty', 'Is your device under manufacturer warranty?', 'A valid bill can help you get a better price.'],
    ['hasGstBill', 'Do you have a GST valid bill with the same serial number?', 'Make sure your bill has the device serial number mentioned on it.'],
  ],
  Mac: [
    ['powersOn', 'Is your Mac powering on properly?', 'Check if the Mac starts and stays on without sudden shutdowns.'],
    ['displayWorking', "Is your Mac's screen working properly?", 'Check for display, brightness, flicker, dead pixel, or line issues.'],
    ['keyboardTrackpadWorking', 'Are the keyboard, trackpad or ports working properly?', 'Choose No if keys, trackpad, USB-C, MagSafe, or ports are faulty.'],
    ['underWarranty', 'Is your device under manufacturer warranty?', 'A valid bill can help you get a better price.'],
    ['hasGstBill', 'Do you have a GST valid bill with the same serial number?', 'Make sure your bill has the device serial number mentioned on it.'],
  ],
  'Other devices': [
    ['powersOn', 'Is your device powering on properly?', 'Check if the device starts and stays on without sudden shutdowns.'],
    ['primaryFunctionWorking', "Is your device's main function working properly?", 'Check the key feature such as audio, camera, watch display, or console output.'],
    ['displayOrBodyOriginal', 'Is the device original and not heavily repaired?', 'Choose Yes if it was never changed or repaired by an unauthorised centre.'],
    ['underWarranty', 'Is your device under manufacturer warranty?', 'A valid bill can help you get a better price.'],
    ['hasGstBill', 'Do you have a GST valid bill with the same serial number?', 'Make sure your bill has the device serial number mentioned on it.'],
  ],
};

const defects = [
  'Broken/scratch on device screen',
  'Dead spot/visible line and discoloration on screen',
  'Scratch/dent on device body',
  'Device panel missing/broken',
];

const mobileProblems = [
  'Front Camera Not Working', 'Back Camera Not Working', 'Volume Button Not Working',
  'Power Button Not Working', 'Silent Switch Not Working', 'Finger Touch Not Working',
  'Face ID / Face Sensor Not Working', 'Proximity Sensor Not Working', 'Wi-Fi Not Working',
  'Bluetooth Not Working', 'Battery Faulty', 'Charging Port Not Working', 'Speaker Not Working',
  'Audio Receiver (Earpiece) Not Working', 'Microphone Not Working', 'Vibrator Not Working',
  'Camera Glass Broken',
];

const problemsByCategory: Record<DeviceType, string[]> = {
  Smartphones: mobileProblems,
  Tablets: mobileProblems.filter((item) => item !== 'Silent Switch Not Working' && item !== 'Face ID / Face Sensor Not Working'),
  Laptops: [
    'Front camera not working',
    'Keyboard not working',
    'Trackpad not working',
    'WiFi not working',
    'Battery faulty',
    'Speaker faulty',
    'Power button not working',
    'Charging port not working',
    'Bluetooth not working',
    'Microphone not working',
    'USB/port not working',
    'Hinge damaged',
    'Display line or flicker',
    'Overheating issue',
    'SSD/HDD faulty',
  ],
  Mac: [
    'Front camera not working',
    'Keyboard not working',
    'Trackpad not working',
    'WiFi not working',
    'Battery faulty',
    'Speaker faulty',
    'Power button not working',
    'Charging port not working',
    'Bluetooth not working',
    'Microphone not working',
    'USB-C/MagSafe port not working',
    'Hinge damaged',
    'Display line or flicker',
    'Overheating issue',
    'Touch ID not working',
  ],
  'Other devices': [
    'Display not working',
    'Buttons not working',
    'WiFi not working',
    'Battery faulty',
    'Speaker faulty',
    'Power button not working',
    'Charging port not working',
    'Bluetooth not working',
    'Microphone not working',
    'Camera/lens problem',
    'Connectivity issue',
    'Accessory missing',
  ],
};

function normalizeCategory(value: string | null): DeviceType {
  if (!value) return 'Smartphones';
  return categoryAliases[value] || 'Smartphones';
}

const sellCategories = [
  { name: 'Smartphones', sub: 'Apple, Samsung, OnePlus & more', image: 'https://ik.imagekit.io/e8vtmc5nh/Picsart_26-07-30_21-18-32-076.png', category: 'Smartphones' },
  { name: 'Laptops', sub: 'Dell, HP, Lenovo, ASUS & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_000000003aa481fa8a4ae4415b099d49.png', category: 'Laptops' },
  { name: 'Tablets', sub: 'iPad, Galaxy Tab, Xiaomi & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_00000000bfcc820b9ec8f0cc9e0379d8.png', category: 'Tablets' },
  { name: 'Mac devices', sub: 'MacBook, iMac, Mac mini & more', image: 'https://ik.imagekit.io/e8vtmc5nh/file_0000000026b8820b9d8f884d7d0d3bf5.png', category: 'Mac' },
  { name: 'Other devices', sub: 'Watches, consoles & accessories', image: 'https://ik.imagekit.io/e8vtmc5nh/file_00000000ae90820ba15f7b2a65f2ca9c.png', category: 'Other devices' },
];

export default function SellDeviceForm() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const initialCategory = normalizeCategory(categoryParam);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    deviceType: initialCategory,
    brand: '',
    deviceName: '',
    storage: '',
    ram: '',
    specs: '',
    expectedPrice: '',
    userName: '',
    customerPhone: '',
    whatsappNumber: '',
    customerEmail: '',
    locationAddress: '',
    locationCity: '',
    locationState: '',
    locationPincode: '',
    conditionAnswers: {} as Record<string, string>,
    defects: [] as string[],
    problems: [] as string[],
    accessories: [] as string[],
    images: [] as string[],
    imagesHtml: '',
  });

  const currentCopy = categoryCopy[form.deviceType];
  const currentQuestions = questionsByCategory[form.deviceType];
  const currentProblems = problemsByCategory[form.deviceType];

  useEffect(() => {
    setSelectedCategory(searchParams.get('category'));
    if (searchParams.get('category')) {
      update('deviceType', normalizeCategory(searchParams.get('category')));
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setForm((current) => ({
          ...current,
          userName: current.userName || user.displayName || '',
          customerEmail: current.customerEmail || user.email || '',
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const update = (field: keyof typeof form, value: any) => setForm((current) => ({ ...current, [field]: value }));
  const toggle = (field: 'defects' | 'problems' | 'accessories', value: string) => setForm((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] }));
  const goBack = () => setStep((current) => Math.max(1, current - 1) as Step);
  const goNext = () => setStep((current) => Math.min(7, current + 1) as Step);

  const canContinue =
    step === 1 ? Boolean(form.brand) :
    step === 2 ? Boolean(form.deviceName.trim() && form.storage && form.ram) :
    step === 3 ? currentQuestions.every(([key]) => form.conditionAnswers[key]) :
    true;

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      setForm((current) => ({ ...current, userName: result.user.displayName || current.userName, customerEmail: result.user.email || current.customerEmail }));
      setError('');
    } catch (issue) {
      console.error(issue);
      setError('Google sign-in could not be completed. Please enter your details manually.');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!auth.currentUser) throw new Error('Please sign in with Google before requesting a pickup.');
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        name: form.userName,
        email: form.customerEmail,
        phone: form.customerPhone,
        whatsappNumber: form.whatsappNumber,
        address: form.locationAddress,
        city: form.locationCity,
        state: form.locationState,
        pincode: form.locationPincode,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      const result = await addDoc(collection(db, 'sell_requests'), {
        deviceType: form.deviceType || '',
        brand: form.brand || '',
        deviceName: form.deviceName || '',
        storage: form.storage || '',
        ram: form.ram || '',
        specs: form.specs || '',
        expectedPrice: Number(form.expectedPrice) || 0,
        userName: form.userName || '',
        customerPhone: form.customerPhone || '',
        whatsappNumber: form.whatsappNumber || '',
        customerEmail: form.customerEmail || '',
        locationAddress: form.locationAddress || '',
        locationCity: form.locationCity || '',
        locationState: form.locationState || '',
        locationPincode: form.locationPincode || '',
        conditionAnswers: form.conditionAnswers || {},
        defects: form.defects || [],
        problems: form.problems || [],
        accessories: form.accessories || [],
        images: form.images || [],
        imagesHtml: form.imagesHtml || '',
        userId: auth.currentUser.uid,
        status: 'pickup_requested',
        paymentStatus: 'pending_inspection',
        finalAmount: null,
        paymentMethod: null,
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
      });
      setSuccessId(result.id);
    } catch (issue) {
      console.error(issue);
      setError('We could not submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successId) return <section className="sell-success"><span>OK</span><h2>Pickup request received.</h2><p>A Selltronics representative will inspect your device in person, confirm the final quote, and pay you by cash or your preferred UPI payment ID.</p><code>{successId}</code><div><a className="btn-primary" href={`/track?order=${successId}`}>Track request</a><button className="btn-ghost" onClick={() => { setSuccessId(null); setStep(1); }}>Sell another device</button></div></section>;

  if (!selectedCategory) {
    return (
      <div className="sell-form-card" style={{ maxWidth: 1000, margin: '20px auto' }}>
        <div className="sell-form-heading" style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="eyebrow">Selltronics</span>
          <h2>Select your device category to begin</h2>
          <p>Choose the type of device you want to sell for a secure, doorstep valuation.</p>
        </div>
        <div className="device-grid-home" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {sellCategories.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setSelectedCategory(item.category);
                update('deviceType', item.category);
                const params = new URLSearchParams(window.location.search);
                params.set('category', item.category);
                window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
              }}
              className="device-category"
              style={{
                textAlign: 'left',
                border: '1px solid #efe9fb',
                borderRadius: '20px',
                background: '#fff',
                padding: '22px',
                minHeight: '200px',
                width: '100%',
                cursor: 'pointer',
                display: 'block',
                position: 'relative'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ink)' }}>{item.name}</h3>
                <p style={{ margin: '5px 0 0 0', color: 'var(--gray)', fontSize: '0.76rem', lineHeight: '1.4', maxWidth: '170px' }}>{item.sub}</p>
              </div>
              <span className="device-arrow" style={{ right: 18, top: 18, display: 'grid', placeItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
              <div className="device-drawing" style={{ position: 'absolute', right: 21, bottom: 15, width: 86, height: 86, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <form onSubmit={submit} className="sell-form-card">
    <div className="sell-form-heading">
      <span className="eyebrow">{currentCopy.eyebrow}</span>
      <h2>{step === 1 ? currentCopy.title : step === 2 ? 'Enter your device model.' : step === 3 ? 'Tell us more about your device.' : step === 4 ? 'Device condition and accessories.' : step === 5 ? 'Functional or Physical Problems' : step === 6 ? 'Upload device images.' : 'Your pickup details.'}</h2>
      <p>{step === 1 ? currentCopy.description : step === 2 ? 'Choose the storage and RAM options for an accurate inspection quote.' : step === 3 ? 'These answers help us prepare an accurate inspection quote.' : step === 4 ? 'Select everything that applies. Final value is confirmed at pickup.' : step === 5 ? 'Please select all applicable issues to receive an accurate quote.' : step === 6 ? 'Show us your device condition by uploading up to 6 pictures.' : 'Sign in with Google if you want, then add expected price and location details.'}</p>
    </div>

    {step === 1 && <div style={{ marginTop: 22 }}>
      <div className="sell-benefits" style={{ justifyContent: 'flex-start', marginTop: 0, marginBottom: 22 }}>{benefits.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="field"><span>{currentCopy.brandLabel}</span><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: 10, marginTop: 8 }}>
        {((showAllBrands || currentCopy.brands.length <= 4) ? currentCopy.brands : currentCopy.brands.slice(0, 4)).map((item) => <button key={item.name} type="button" onClick={() => update('brand', item.name)} style={{ minHeight: 74, padding: '10px 9px', border: form.brand === item.name ? '2px solid var(--violet-700)' : '1px solid #E3D9F9', borderRadius: 12, background: form.brand === item.name ? 'var(--lavender-100)' : '#fff', display: 'grid', placeItems: 'center', gap: 6, fontWeight: 700, cursor: 'pointer' }}>{item.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.logo} alt="" width="24" height="24" />
      ) : <b>{item.mark}</b>}<span style={{ margin: 0 }}>{item.name}</span></button>)}
        {currentCopy.brands.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAllBrands(!showAllBrands)}
            style={{
              minHeight: 74,
              padding: '10px 9px',
              border: '1px dashed var(--violet-700)',
              borderRadius: 12,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              cursor: 'pointer',
              color: 'var(--violet-700)'
            }}
          >
            {showAllBrands ? 'Show Less' : '+ More Brands'}
          </button>
        )}
      </div></div>
    </div>}

    {step === 2 && <div className="sell-form-grid">
      <label className="field"><span>{currentCopy.modelLabel}</span><input required value={form.deviceName} onChange={(e) => update('deviceName', e.target.value)} placeholder={currentCopy.modelPlaceholder} /></label>
      <label className="field"><span>Storage</span><select required value={form.storage} onChange={(e) => update('storage', e.target.value)}><option value="">Choose storage</option>{currentCopy.storageOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label className="field"><span>RAM</span><select required value={form.ram} onChange={(e) => update('ram', e.target.value)}><option value="">Choose RAM</option>{currentCopy.ramOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label className="field"><span>{currentCopy.specLabel}</span><input value={form.specs} onChange={(e) => update('specs', e.target.value)} placeholder={currentCopy.specPlaceholder} /></label>
    </div>}

    {step === 3 && <div style={{ marginTop: 22 }}>{currentQuestions.map(([key, title, hint]) => <div className="field" key={key} style={{ marginBottom: 18 }}><span>{title}</span><small>{hint}</small><div style={{ display: 'flex', gap: 10, marginTop: 8 }}>{['Yes', 'No'].map((answer) => <button type="button" key={answer} onClick={() => setForm((current) => ({ ...current, conditionAnswers: { ...current.conditionAnswers, [key]: answer } }))} className={form.conditionAnswers[key] === answer ? 'btn-primary' : 'btn-ghost'}>{answer}</button>)}</div></div>)}</div>}

    {step === 4 && <section className="condition-section" aria-labelledby="condition-title"><div className="condition-section-heading"><span className="eyebrow">Quick condition check</span><h3 id="condition-title">Screen &amp; body condition</h3><p>Select every visible issue that applies. This helps us prepare a fair pickup quote.</p></div><div className="condition-options">{defects.map((item) => <label key={item} className="condition-option"><input type="checkbox" checked={form.defects.includes(item)} onChange={() => toggle('defects', item)} /><span>{item}</span></label>)}</div></section>}

    {step === 5 && <div className="field" style={{ marginTop: 22 }}><span>Functional or Physical Problems</span><small>Please select all applicable issues to receive an accurate quote.</small><div className="problem-options">{currentProblems.map((item) => <label key={item} className="problem-option"><input type="checkbox" checked={form.problems.includes(item)} onChange={() => toggle('problems', item)} /><span>{item}</span></label>)}</div></div>}

    {step === 6 && <div style={{ marginTop: 22 }}>
      <div className="field">
        <span>Upload Device Images (Up to 6 images)</span>
        <small style={{ display: 'block', marginBottom: 12 }}>Upload clear photos of the front, back, and sides of your device.</small>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 6);
              if (files.length === 0) return;
              
              const readPromises = files.map((file) => {
                return new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                });
              });
              
              Promise.all(readPromises).then((base64Strings) => {
                const htmlString = `
                  <div class="device-images-rendered" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                    ${base64Strings.map((base64) => `
                      <img src="${base64}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1.5px solid #E3D9F9;" alt="Device upload" />
                    `).join('')}
                  </div>
                `.trim();
                update('imagesHtml', htmlString);
              });
            }}
            style={{ display: 'none' }}
            id="device-images-input"
          />
          <label
            htmlFor="device-images-input"
            className="btn-ghost"
            style={{
              padding: '12px 20px',
              border: '2px dashed var(--violet-700)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--violet-700)',
              display: 'inline-block'
            }}
          >
            📷 Choose Photos (Max 6)
          </label>
          
          {form.imagesHtml && (
            <button
              type="button"
              onClick={() => update('imagesHtml', '')}
              className="btn-ghost"
              style={{
                borderColor: '#FEE2E2',
                color: '#EF4444',
                padding: '12px 20px',
                borderRadius: '12px',
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {form.imagesHtml && (
          <div style={{ border: '1px solid #E3D9F9', borderRadius: '12px', padding: '12px', background: '#FAF7FF' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1B29', display: 'block', marginBottom: 8 }}>Preview Rendered HTML:</span>
            <div dangerouslySetInnerHTML={{ __html: form.imagesHtml }} />
          </div>
        )}
      </div>
    </div>}

    {step === 7 && <div className="sell-form-grid">
      {!currentUser ? (
        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', border: '1px solid #E3D9F9', borderRadius: '16px', background: '#FAF7FF', textAlign: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1E1B29' }}>Please verify your identity to proceed</h3>
          <p style={{ fontSize: '0.88rem', color: '#6E6683', maxWidth: '340px' }}>Sign in or Sign up with Google to secure your request and proceed with the pickup details.</p>
          <button type="button" onClick={signInWithGoogle} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
            Sign in / Sign up with Google
          </button>
        </div>
      ) : (
        <>
          <label className="field"><span>Expected price (Rs.)</span><input required type="number" min="0" value={form.expectedPrice} onChange={(e) => update('expectedPrice', e.target.value)} placeholder="e.g. 25000" /></label>
          <label className="field"><span>Your name</span><input required value={form.userName} onChange={(e) => update('userName', e.target.value)} /></label>
          <label className="field"><span>Phone number</span><input required type="tel" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} placeholder="10-digit mobile number" /></label>
          <label className="field"><span>WhatsApp number</span><input required type="tel" value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} placeholder="For pickup/status updates" /></label>
          <label className="field"><span>Email</span><input required type="email" value={form.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} /></label>
          <label className="field"><span>Full address</span><input required value={form.locationAddress} onChange={(e) => update('locationAddress', e.target.value)} placeholder="House / flat, street, area" /></label>
          <label className="field"><span>City</span><input required value={form.locationCity} onChange={(e) => update('locationCity', e.target.value)} /></label>
          <label className="field"><span>State</span><input required value={form.locationState} onChange={(e) => update('locationState', e.target.value)} /></label>
          <label className="field"><span>Pincode</span><input required value={form.locationPincode} onChange={(e) => update('locationPincode', e.target.value)} /></label>
        </>
      )}
    </div>}

    {error && <p className="track-error">{error}</p>}
    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      {step > 1 && <button className="btn-ghost" type="button" onClick={goBack}>Back</button>}
      {step < 7 ? (canContinue && <button className="btn-primary" type="button" onClick={goNext} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Continue <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>) : (currentUser && <button className="btn-primary sell-submit" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{loading ? 'Saving your request...' : <>Request pickup <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></>}</button>)}
    </div>
  </form>;
}
