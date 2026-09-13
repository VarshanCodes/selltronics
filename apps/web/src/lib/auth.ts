import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  // Direct explicit check to ensure native plugin intercepts are NEVER skipped when inside the mobile app view.
  // We inspect window.Capacitor directly because your web bundle is loaded via a remote URL (https://selltronics.store).
  const isNative = typeof window !== 'undefined' && (
    !!(window as any).Capacitor ||
    (window as any).Capacitor?.isNative === true ||
    navigator.userAgent.includes('Capacitor') ||
    window.location.href.includes('capacitor://') ||
    Capacitor.getPlatform() === 'android' ||
    Capacitor.getPlatform() === 'ios'
  );

  console.log('[Auth] handleGoogleLogin invoked. isNative:', isNative, 'platform:', Capacitor.getPlatform());

  if (isNative) {
    console.log('[Auth] Remote context confirmed inside Native App Wrapper. Forcing direct native native engine prompt.');
    try {
      // Direct call to Capawesome Native Auth plugin. This opens a native account overlay, NOT a browser tab.
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log('[Auth] Native account prompt responded successfully.');

      const idToken = result?.credential?.idToken || (result as any)?.idToken;
      if (!idToken) {
        throw new Error('Native sheet succeeded but returned no idToken verification signature.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential;
    } catch (error: any) {
      console.error('[Auth] Native accounts overlay interface thrown an exception:', error);
      throw error;
    }
  }

  // 2. STANDARD WEB SITE FLOW ONLY (When visiting selltronics.store from normal Safari/Chrome mobile apps)
  try {
    console.log('[Auth] Running outside app context (Standard Desktop/Mobile Browser).');
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error: any) {
    console.error('[Auth] Web popups handler exception context:', error);
    throw error;
  }
};
