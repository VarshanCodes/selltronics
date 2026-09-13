import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.selltronics.app',
  appName: 'SellTronics',
  webDir: 'public',
  server: {
    // Replace with your actual live Vercel URL
    url: 'https://selltronics.store',
    cleartext: true,
    allowNavigation: [
      'selltronics.store',
      '*.selltronics.store'
    ]
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT'
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
      serverClientId: '552424549072-2m5ibcahng6e94dlumjvhaq7vvjrr862.apps.googleusercontent.com'
    } as any
  }
};

export default config;

