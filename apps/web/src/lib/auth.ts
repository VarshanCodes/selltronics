import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  console.log('[Auth] handleGoogleLogin invoked. isNativePlatform:', isNative, 'platform:', Capacitor.getPlatform());

  try {
    if (isNative) {
      console.log('[Auth] Triggering native FirebaseAuthentication.signInWithGoogle()...');

      let result;
      try {
        result = await FirebaseAuthentication.signInWithGoogle();
        console.log('[Auth] Native signInWithGoogle response:', JSON.stringify(result));
      } catch (nativeErr: any) {
        console.warn('[Auth] Primary signInWithGoogle attempt threw an error, trying legacy fallback mode:', nativeErr);
        result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
        console.log('[Auth] Legacy signInWithGoogle response:', JSON.stringify(result));
      }

      const idToken = result?.credential?.idToken;
      console.log('[Auth] Native ID Token exists:', Boolean(idToken));

      if (!idToken) {
        throw new Error('Native Google Sign-In succeeded but no ID token was returned in credential.');
      }

      console.log('[Auth] Creating GoogleAuthProvider credential from ID token...');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      console.log('[Auth] Firebase web session successfully established for:', userCredential.user.email);
      return userCredential;
    } else {
      console.log('[Auth] Browser detected: falling back to standard web signInWithPopup...');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log('[Auth] Web signInWithPopup completed for:', userCredential.user.email);
      return userCredential;
    }
  } catch (error: any) {
    console.error('[Auth] Google Sign-In failed with exception:', error);
    console.error('[Auth] Error message:', error?.message || error);
    console.error('[Auth] Error code:', error?.code);
    console.error('[Auth] Error stack:', error?.stack);
    throw error;
  }
};
