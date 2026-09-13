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
      providers: ['google.com']
    }
  }
};

export default config;

