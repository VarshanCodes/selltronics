import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  console.log('[Auth] handleGoogleLogin invoked. isNative:', isNative, 'platform:', Capacitor.getPlatform());

  // 1. STRICT NATIVE-ONLY FLOW FOR MOBILE (Android / iOS)
  // Deep linking back from a browser tab is not configured, so NEVER fall back to web popup/redirect.
  if (isNative) {
    console.log('[Auth] Native platform detected: strictly enforcing FirebaseAuthentication.signInWithGoogle()...');

    try {
      if (!Capacitor.isPluginAvailable('FirebaseAuthentication')) {
        throw new Error(
          'FirebaseAuthentication plugin is missing or not registered in this Android build. ' +
          'Please rebuild and install the Android app from Android Studio after running "npx cap sync android".'
        );
      }

      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log('[Auth] Native signInWithGoogle response:', JSON.stringify(result));

      const idToken = result?.credential?.idToken;
      console.log('[Auth] Native ID Token exists:', Boolean(idToken));

      if (!idToken) {
        throw new Error('Native Google Sign-In succeeded, but no ID token was returned.');
      }

      console.log('[Auth] Creating GoogleAuthProvider credential from native ID token...');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      console.log('[Auth] Firebase web session successfully established for:', userCredential.user.email);
      return userCredential;
    } catch (error: any) {
      console.error('[Auth] Native Google Sign-In failed:', error);
      const errorMsg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));

      if (typeof window !== 'undefined') {
        (error as any)._alerted = true;
        alert('Google Sign-In Failed:\n' + errorMsg);
      }

      // Strictly reject: do NOT attempt any web browser fallback on native
      throw error;
    }
  }

  // 2. STANDARD DESKTOP / MOBILE WEB BROWSER FLOW ONLY
  try {
    console.log('[Auth] Standard browser detected: executing web signInWithPopup...');
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    console.log('[Auth] Web signInWithPopup completed for:', userCredential.user.email);
    return userCredential;
  } catch (error: any) {
    console.error('[Auth] Web Google Sign-In failed:', error);
    throw error;
  }
};
