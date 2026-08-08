'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { getLiveModelsAndPrices, getSingleModelPrice } from '@/app/actions/pricingEngine';

type DeviceType = 'Smartphones' | 'Laptops' | 'Tablets' | 'Mac' | 'Other devices';
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
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

function compressImage(base64Str: string, maxWidth = 600, maxHeight = 600, quality = 0.7): Promise<string> {
  if (typeof window === 'undefined') return Promise.resolve(base64Str);
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

function sanitizeValue(value: any): any {
  if (value === undefined) return '';
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }
  return value;
}

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
  
  // Pricing states
  const [aiDeviceList, setAiDeviceList] = useState<{ model: string; basePrice: number }[]>([]);
  const [customModelPrice, setCustomModelPrice] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
        // Auto-skip Google verification page if authenticated
        setStep((currentStep) => {
          if (currentStep === 8) {
            return 9;
          }
          return currentStep;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Background fetch/cache list of popular models when brand/category selected
  useEffect(() => {
    if (form.brand && form.deviceType) {
      const fetchModelsAndPrices = async () => {
        try {
          setIsAiLoading(true);
          const cacheKey = `${form.deviceType}_${form.brand}`;
          const cacheRef = doc(db, 'pricing_caches', cacheKey);
          const cacheSnap = await getDoc(cacheRef);
          
          if (cacheSnap.exists()) {
            const cacheData = cacheSnap.data();
            const updatedAt = cacheData.updatedAt?.toDate() || new Date(0);
            const now = new Date();
            const diffDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
            
            if (diffDays < 7 && Array.isArray(cacheData.models) && cacheData.models.length > 0) {
              setAiDeviceList(cacheData.models);
              setIsAiLoading(false);
              return;
            }
          }
          
          const data = await getLiveModelsAndPrices(form.deviceType, form.brand);
          if (Array.isArray(data) && data.length > 0) {
            setAiDeviceList(data);
            await setDoc(cacheRef, {
              models: data,
              updatedAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Error fetching/caching models:', err);
        } finally {
          setIsAiLoading(false);
        }
      };
      
      fetchModelsAndPrices();
    } else {
      setAiDeviceList([]);
    }
  }, [form.brand, form.deviceType]);

  // Debounced background fetch for custom typed models
  useEffect(() => {
    if (!form.deviceName || !form.brand || !form.deviceType) {
      setCustomModelPrice(null);
      return;
    }
    
    const found = aiDeviceList.find(d => d.model.toLowerCase() === form.deviceName.toLowerCase());
    if (found) {
      setCustomModelPrice(null);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const cacheId = `${form.deviceType}_${form.brand}_${form.deviceName}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const cacheRef = doc(db, 'custom_device_prices', cacheId);
        const cacheSnap = await getDoc(cacheRef);
        
        if (cacheSnap.exists()) {
          const cacheData = cacheSnap.data();
          const updatedAt = cacheData.updatedAt?.toDate() || new Date(0);
          const now = new Date();
          const diffDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
          
          if (diffDays < 7 && typeof cacheData.price === 'number') {
            setCustomModelPrice(cacheData.price);
            return;
          }
        }
        
        const price = await getSingleModelPrice(form.deviceType, form.brand, form.deviceName);
        if (price > 0) {
          setCustomModelPrice(price);
          await setDoc(cacheRef, {
            price,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Error fetching custom model price:', err);
      }
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [form.deviceName, form.brand, form.deviceType, aiDeviceList]);

  // Pricing engine helpers
  const getStorageMultiplier = (storageStr: string): number => {
    if (!storageStr) return 1.0;
    const clean = storageStr.replace(/\s+/g, '').toUpperCase();
    if (clean.includes('32GB')) return 0.75;
    if (clean.includes('64GB')) return 0.85;
    if (clean.includes('128GB')) return 1.0;
    if (clean.includes('256GB')) return 1.15;
    if (clean.includes('512GB')) return 1.30;
    if (clean.includes('1TB')) return 1.45;
    if (clean.includes('2TB')) return 1.60;
    return 1.0;
  };

  const getConditionMultiplier = (): { conditionName: string; multiplier: number } => {
    const answers = form.conditionAnswers;
    const isCriticalBroken = 
      answers.powersOn === 'No' || 
      answers.canMakeCalls === 'No' || 
      answers.touchWorking === 'No' ||
      answers.primaryFunctionWorking === 'No' ||
      form.problems.includes('Power Button Not Working') ||
      form.problems.includes('Battery Faulty');
      
    if (isCriticalBroken) {
      return { conditionName: 'Broken', multiplier: 0.25 };
    }
    
    const hasMajorDefect = 
      form.defects.includes('Broken/scratch on device screen') ||
      form.defects.includes('Dead spot/visible line and discoloration on screen');
      
    if (hasMajorDefect) {
      return { conditionName: 'Fair', multiplier: 0.65 };
    }
    
    const minorIssuesCount = form.defects.length + form.problems.length;
    if (minorIssuesCount >= 3) {
      return { conditionName: 'Fair', multiplier: 0.65 };
    }
    
    if (minorIssuesCount > 0 || answers.screenOriginal === 'No') {
      return { conditionName: 'Good', multiplier: 0.85 };
    }
    
    return { conditionName: 'Flawless', multiplier: 1.0 };
  };

  const calculateEstimatedPriceRange = (): { min: number; max: number } => {
    const activeDevice = aiDeviceList.find(d => d.model.toLowerCase() === form.deviceName.toLowerCase());
    let basePrice = 0;
    
    if (activeDevice) {
      basePrice = activeDevice.basePrice;
    } else if (customModelPrice !== null) {
      basePrice = customModelPrice;
    } else {
      if (aiDeviceList.length > 0) {
        const sum = aiDeviceList.reduce((acc, curr) => acc + curr.basePrice, 0);
        basePrice = Math.round(sum / aiDeviceList.length);
      } else {
        basePrice = 18000; // reasonable average base price in INR
      }
    }
    
    const condMultiplier = getConditionMultiplier().multiplier;
    const storMultiplier = getStorageMultiplier(form.storage);
    const exactValue = basePrice * condMultiplier * storMultiplier;
    
    return {
      min: Math.floor(exactValue * 0.90),
      max: Math.ceil(exactValue * 1.10)
    };
  };

  const priceRange = calculateEstimatedPriceRange();

  // Prefill expected price when entering final page
  useEffect(() => {
    if (step === 9 && !form.expectedPrice && priceRange.max > 0) {
      const avgPrice = Math.round((priceRange.min + priceRange.max) / 2);
      update('expectedPrice', avgPrice.toString());
    }
  }, [step, priceRange]);

  const update = (field: keyof typeof form, value: any) => setForm((current) => ({ ...current, [field]: value }));
  const toggle = (field: 'defects' | 'problems' | 'accessories', value: string) => setForm((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] }));
  
  const goBack = () => {
    setStep((current) => {
      if (current === 9) {
        if (currentUser) {
          return 7; // Go straight back to estimate
        } else {
          return 8; // Back to google sign in
        }
      }
      return Math.max(1, current - 1) as Step;
    });
  };
  
  const goNext = () => {
    setStep((current) => {
      if (current === 7) {
        if (currentUser) {
          return 9; // Skip Step 8 if already signed in
        } else {
          return 8;
        }
      }
      return Math.min(9, current + 1) as Step;
    });
  };

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

      // 1. Try to save user profile details (wrapped to prevent blocking the main sell request)
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          name: form.userName || '',
          email: form.customerEmail || '',
          phone: form.customerPhone || '',
          whatsappNumber: form.whatsappNumber || '',
          address: form.locationAddress || '',
          city: form.locationCity || '',
          state: form.locationState || '',
          pincode: form.locationPincode || '',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (userError) {
        console.warn('Non-blocking user collection write failed:', userError);
      }

      // 2. Build the sanitized payload for sell request
      const rawPayload = {
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
      };

      const sanitizedPayload = sanitizeValue(rawPayload);

      // 3. Write to Firestore 'sell_requests' collection
      const result = await addDoc(collection(db, 'sell_requests'), sanitizedPayload);
      setSuccessId(result.id);
    } catch (issue) {
      console.error('Firestore submission error details:', issue);
      const msg = issue instanceof Error ? issue.message : String(issue);
      setError(`We could not submit your request: ${msg}. Please try again.`);
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
        <div className="device-grid-home">
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
                width: '100%',
                cursor: 'pointer',
                display: 'block'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ink)' }}>{item.name}</h3>
                <p>{item.sub}</p>
              </div>
              <span className="device-arrow">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
              <div className="device-drawing">
                <img src={item.image} alt={item.name} />
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
      <h2>{
        step === 1 ? currentCopy.title : 
        step === 2 ? 'Enter your device model.' : 
        step === 3 ? 'Tell us more about your device.' : 
        step === 4 ? 'Device condition and accessories.' : 
        step === 5 ? 'Functional or Physical Problems' : 
        step === 6 ? 'Upload device images.' : 
        step === 7 ? 'Estimated trade-in value.' : 
        step === 8 ? 'Verify your identity.' : 
        'Your pickup details.'
      }</h2>
      <p>{
        step === 1 ? currentCopy.description : 
        step === 2 ? 'Choose the storage and RAM options for an accurate inspection quote.' : 
        step === 3 ? 'These answers help us prepare an accurate inspection quote.' : 
        step === 4 ? 'Select everything that applies. Final value is confirmed at pickup.' : 
        step === 5 ? 'Please select all applicable issues to receive an accurate quote.' : 
        step === 6 ? 'Show us your device condition by uploading up to 6 pictures.' : 
        step === 7 ? 'Here is the instant estimated quote for your device based on its condition.' : 
        step === 8 ? 'Please sign in with Google to secure your pickup request.' : 
        'Confirm your expected price and enter your location details.'
      }</p>
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
      <label className="field">
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentCopy.modelLabel}
          {isAiLoading && <small style={{ color: 'var(--violet-700)', fontWeight: 600 }}>Preloading models...</small>}
        </span>
        <input 
          list="ai-models" 
          required 
          value={form.deviceName} 
          onChange={(e) => update('deviceName', e.target.value)} 
          placeholder={currentCopy.modelPlaceholder} 
        />
        <datalist id="ai-models">
          {aiDeviceList.map((device, idx) => (
            <option key={idx} value={device.model} />
          ))}
        </datalist>
      </label>
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
                  reader.onloadend = () => {
                    const rawBase64 = reader.result as string;
                    compressImage(rawBase64, 600, 600, 0.7).then((compressed) => {
                      resolve(compressed);
                    });
                  };
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
                setForm((current) => ({
                  ...current,
                  images: base64Strings,
                  imagesHtml: htmlString
                }));
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
              onClick={() => setForm((current) => ({ ...current, images: [], imagesHtml: '' }))}
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

    {step === 7 && <div style={{ marginTop: 22 }}>
      <div style={{ padding: '24px', background: 'var(--lavender-100)', borderRadius: '16px', border: '1.5px solid #E3D9F9', textAlign: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--violet-700)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>
          LIVE ESTIMATED TRADE-IN VALUE
        </span>
        <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ink)', margin: '8px 0 16px' }}>
          Rs. {priceRange.min.toLocaleString()} - Rs. {priceRange.max.toLocaleString()}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0', padding: '16px', background: '#fff', borderRadius: '12px', textAlign: 'left', fontSize: '0.9rem' }}>
          <div>
            <span style={{ display: 'block', color: '#6E6683', fontSize: '0.8rem' }}>Device</span>
            <strong style={{ color: 'var(--ink)' }}>{form.brand} {form.deviceName}</strong>
          </div>
          <div>
            <span style={{ display: 'block', color: '#6E6683', fontSize: '0.8rem' }}>Storage &amp; RAM</span>
            <strong style={{ color: 'var(--ink)' }}>{form.storage} / {form.ram}</strong>
          </div>
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #FAF7FF', paddingTop: '10px', marginTop: '4px' }}>
            <span style={{ display: 'block', color: '#6E6683', fontSize: '0.8rem' }}>Evaluated Condition</span>
            <strong style={{ color: 'var(--violet-700)' }}>{getConditionMultiplier().conditionName}</strong>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#6E6683', margin: '0 0 8px', lineHeight: 1.4 }}>
          *This is a live estimate based on current market trends for a {form.brand} {form.deviceName} in {getConditionMultiplier().conditionName.toLowerCase()} condition. Final payout is verified in person upon doorstep inspection.
        </p>
      </div>
    </div>}

    {step === 8 && <div className="sell-form-grid">
      <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', border: '1px solid #E3D9F9', borderRadius: '16px', background: '#FAF7FF', textAlign: 'center', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1E1B29' }}>Please verify your identity to proceed</h3>
        <p style={{ fontSize: '0.88rem', color: '#6E6683', maxWidth: '340px' }}>Sign in or Sign up with Google to secure your request and proceed with the pickup details.</p>
        <button type="button" onClick={signInWithGoogle} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
          Sign in / Sign up with Google
        </button>
      </div>
    </div>}

    {step === 9 && <div className="sell-form-grid">
      <label className="field"><span>Expected price (Rs.)</span><input required type="number" min="0" value={form.expectedPrice} onChange={(e) => update('expectedPrice', e.target.value)} placeholder="e.g. 25000" /></label>
      <label className="field"><span>Your name</span><input required value={form.userName} onChange={(e) => update('userName', e.target.value)} /></label>
      <label className="field"><span>Phone number</span><input required type="tel" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} placeholder="10-digit mobile number" /></label>
      <label className="field"><span>WhatsApp number</span><input required type="tel" value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} placeholder="For pickup/status updates" /></label>
      <label className="field"><span>Email</span><input required type="email" value={form.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} /></label>
      <label className="field"><span>Full address</span><input required value={form.locationAddress} onChange={(e) => update('locationAddress', e.target.value)} placeholder="House / flat, street, area" /></label>
      <label className="field"><span>City</span><input required value={form.locationCity} onChange={(e) => update('locationCity', e.target.value)} /></label>
      <label className="field"><span>State</span><input required value={form.locationState} onChange={(e) => update('locationState', e.target.value)} /></label>
      <label className="field"><span>Pincode</span><input required value={form.locationPincode} onChange={(e) => update('locationPincode', e.target.value)} /></label>
    </div>}

    {error && <p className="track-error">{error}</p>}
    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      {step > 1 && <button className="btn-ghost" type="button" onClick={goBack}>Back</button>}
      {step < 9 ? (
        canContinue && (
          <button 
            className="btn-primary" 
            type="button" 
            onClick={goNext} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {step === 7 ? 'Proceed with Quote' : 'Continue'} 
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        )
      ) : (
        currentUser && (
          <button 
            className="btn-primary sell-submit" 
            disabled={loading} 
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {loading ? 'Saving your request...' : <>Request pickup <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></>}
          </button>
        )
      )}
    </div>
  </form>;
}
