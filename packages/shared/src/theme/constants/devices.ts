import { DeviceCategory } from '@repo/types';

export const DEVICE_CATEGORIES: DeviceCategory[] = [
  {
    id: 'cat-1',
    name: 'Smartphone',
    slug: 'smartphone',
    icon: 'smartphone-icon',
    brands: [
      {
        name: 'Apple',
        slug: 'apple',
        models: [
          {
            name: 'iPhone 14 Pro',
            slug: 'iphone-14-pro',
            basePrice: 52000,
            image: '/images/devices/iphone-14-pro.png'
          },
          {
            name: 'iPhone 13',
            slug: 'iphone-13',
            basePrice: 28500,
            image: '/images/devices/iphone-13.png'
          }
        ]
      },
      {
        name: 'Samsung',
        slug: 'samsung',
        models: [
          {
            name: 'Samsung S23 Ultra',
            slug: 'samsung-s23-ultra',
            basePrice: 41500,
            image: '/images/devices/s23-ultra.png'
          }
        ]
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Laptop',
    slug: 'laptop',
    icon: 'laptop-icon',
    brands: [
      {
        name: 'Apple',
        slug: 'apple',
        models: [
          {
            name: 'MacBook Air M1',
            slug: 'macbook-air-m1',
            basePrice: 58000,
            image: '/images/devices/macbook-air-m1.png'
          }
        ]
      }
    ]
  }
];