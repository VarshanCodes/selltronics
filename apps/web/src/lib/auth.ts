import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  // Check if inside a native webview container or running within native context
  const isNative = typeof window !== 'undefined' && (
    Capacitor.isNativePlatform() ||
    !!(window as any).Capacitor ||
    (window as any).Capacitor?.isNative === true ||
    navigator.userAgent.includes('Capacitor') ||
    window.location.href.includes('capacitor://')
  );

  console.log('[Auth] handleGoogleLogin invoked. isNative:', isNative, 'platform:', Capacitor.getPlatform(), 'URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

  if (isNative) {
    console.log('[Auth] Native container match: executing native plugin sign-in with Google parameter options...');
    try {
      const result = await FirebaseAuthentication.signInWithGoogle({
        webClientId: '552424549072-2m5ibcahng6e94dlumjvhaq7vvjrr862.apps.googleusercontent.com'
      });
      console.log('[Auth] Native plugin result payload token parsing...');

      // Handle both standard capawesome plugin structures or credential token options fallback
      const idToken = result?.credential?.idToken || (result as any)?.idToken;
      if (!idToken) {
        throw new Error('Google native provider authentication returned an empty validation ID token token.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential;
    } catch (error: any) {
      console.error('[Auth] Native transaction intercept failure handler:', error);

      // If native plugin initialization throws because of a mismatch with the remote web domain view context shell wrapper, fallback safely to standard explicit redirection flow parameters
      try {
        console.log('[Auth] Attempting alternate explicit redirect federated sign-in fallback chain...');
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        return userCredential;
      } catch (innerErr) {
        console.error('[Auth] Alternate fallback authentication chain error payload:', innerErr);
        throw error;
      }
    }
  }

  // Standard web browser fallback
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error: any) {
    console.error('[Auth] Web fallback authorization error context:', error);
    throw error;
  }
};
