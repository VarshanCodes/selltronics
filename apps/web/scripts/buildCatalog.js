const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../../../phonebrand_index.html'), 'utf8');
const start = htmlContent.indexOf('const data = ') + 'const data = '.length;
let depth = 0;
let end = -1;
for (let i = start; i < htmlContent.length; i++) {
  if (htmlContent[i] === '[') depth++;
  else if (htmlContent[i] === ']') {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const rawData = JSON.parse(htmlContent.substring(start, end));

// Ensure Nothing exists
if (!rawData.some(b => b.brand.toLowerCase() === 'nothing')) {
  rawData.push({
    brand: 'Nothing',
    url: 'https://nothing.tech',
    series: [
      {
        name: 'Phone Series',
        models: [
          { name: 'Nothing Phone (2a) Plus', src: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a-plus.jpg', slug: 'nothing-phone-2a-plus' },
          { name: 'Nothing Phone (2a)', src: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a.jpg', slug: 'nothing-phone-2a' },
          { name: 'Nothing Phone (2)', src: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2.jpg', slug: 'nothing-phone-2' },
          { name: 'Nothing Phone (1)', src: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-1.jpg', slug: 'nothing-phone-1' },
          { name: 'CMF Phone 1', src: 'https://fdn2.gsmarena.com/vv/bigpic/cmf-phone-1.jpg', slug: 'cmf-phone-1' }
        ]
      }
    ]
  });
}

const outDir = path.resolve(__dirname, '../src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const fileHeader = `// Auto-generated Smartphone Catalogue from phonebrand source
export interface PhoneModel {
  name: string;
  src: string;
  source?: string;
  slug?: string;
}

export interface PhoneSeries {
  name: string;
  models: PhoneModel[];
}

export interface PhoneBrand {
  brand: string;
  url?: string;
  series: PhoneSeries[];
}

export const PHONE_CATALOG: PhoneBrand[] = `;

const fileFooter = `;

export function normalizeBrandName(brandName: string): string {
  const b = (brandName || '').trim().toLowerCase();
  if (b.includes('apple') || b.includes('iphone')) return 'Apple';
  if (b.includes('samsung') || b.includes('galaxy')) return 'Samsung';
  if (b.includes('redmi')) return 'Redmi';
  if (b.includes('poco')) return 'POCO';
  if (b.includes('xiaomi') || b.includes('mi')) return 'Xiaomi';
  if (b.includes('oneplus')) return 'OnePlus';
  if (b.includes('google') || b.includes('pixel')) return 'Google';
  if (b.includes('vivo') || b.includes('iqoo')) return 'vivo';
  if (b.includes('oppo')) return 'OPPO';
  if (b.includes('realme')) return 'realme';
  if (b.includes('motorola') || b.includes('moto')) return 'Motorola';
  if (b.includes('nothing')) return 'Nothing';
  if (b.includes('huawei')) return 'Huawei';
  return brandName;
}

export function getBrandCatalog(brandName: string): PhoneBrand | null {
  if (!brandName) return null;
  const normalized = normalizeBrandName(brandName).toLowerCase();

  // Special handle for Redmi alias
  if (normalized === 'redmi') {
    const xiaomi = PHONE_CATALOG.find((b) => b.brand.toLowerCase() === 'xiaomi');
    if (xiaomi) {
      return {
        brand: 'Redmi',
        url: xiaomi.url,
        series: xiaomi.series.filter((s) => s.name.toLowerCase().includes('redmi')),
      };
    }
  }

  // Special handle for POCO alias
  if (normalized === 'poco') {
    const xiaomi = PHONE_CATALOG.find((b) => b.brand.toLowerCase() === 'xiaomi');
    if (xiaomi) {
      return {
        brand: 'POCO',
        url: xiaomi.url,
        series: xiaomi.series.filter((s) => s.name.toLowerCase().includes('poco')),
      };
    }
  }

  const directMatch = PHONE_CATALOG.find(
    (b) => b.brand.toLowerCase() === normalized || normalized.includes(b.brand.toLowerCase())
  );
  if (directMatch) return directMatch;

  return null;
}

export const DEFAULT_STORAGE_OPTIONS = [
  '32 GB',
  '64 GB',
  '128 GB',
  '256 GB',
  '512 GB',
  '1 TB',
  'Not sure',
];

export const DEFAULT_RAM_OPTIONS = [
  '2 GB',
  '3 GB',
  '4 GB',
  '6 GB',
  '8 GB',
  '12 GB',
  '16 GB',
  'Not sure',
];
`;

const fullTs = fileHeader + JSON.stringify(rawData, null, 2) + fileFooter;
fs.writeFileSync(path.join(outDir, 'phoneCatalog.ts'), fullTs, 'utf8');
console.log('Successfully written apps/web/src/data/phoneCatalog.ts');

