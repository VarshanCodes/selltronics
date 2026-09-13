import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  // Enhanced native detection for remote URL hosting environments where Capactor platform string inside the web bundle might default to 'web'.
  const isNative = typeof window !== 'undefined' && (
    Capacitor.isNativePlatform() ||
    !!(window as any).Capacitor ||
    (window as any).Capacitor?.isNative === true ||
    navigator.userAgent.includes('Capacitor')
  );
  console.log('[Auth] handleGoogleLogin invoked. isNative:', isNative, 'platform:', Capacitor.getPlatform());

  // 1. STRICT NATIVE-ONLY FLOW FOR MOBILE (Android / iOS)
  if (isNative) {
    console.log('[Auth] Native platform detected: directly executing FirebaseAuthentication.signInWithGoogle()...');

    try {
      const result = await FirebaseAuthentication.signInWithGoogle({
        webClientId: '552424549072-2m5ibcahng6e94dlumjvhaq7vvjrr862.apps.googleusercontent.com'
      });
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
      console.error('[Auth] Native Google Sign-In failed with exception:', error);
      console.error('[Auth] Error message:', error?.message || error);
      console.error('[Auth] Error code:', error?.code);
      console.error('[Auth] Error stack:', error?.stack);

      // Re-throw without attempting any web browser fallback on native
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
