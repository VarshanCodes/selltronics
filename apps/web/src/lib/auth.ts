import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/firebase';

/**
 * Asynchronous bridge-ready check before invoking native plugins.
 * Waits for deviceready or Capacitor bridge events, with fallback timeout.
 */
const waitForBridgeReady = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  if ((window as any).Capacitor?.isNative === true || (window as any).androidBridge) {
    return;
  }

  await new Promise<void>((resolve) => {
    let resolved = false;
    const onReady = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      document.removeEventListener('deviceready', onReady);
      window.removeEventListener('capacitorReady', onReady);
    };

    document.addEventListener('deviceready', onReady);
    window.addEventListener('capacitorReady', onReady);

    setTimeout(onReady, 500);
  });
};

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  const isNative = typeof window !== 'undefined' && (
    Capacitor.isNativePlatform() ||
    (window as any).Capacitor?.isNative === true ||
    Capacitor.getPlatform() === 'android' ||
    Capacitor.getPlatform() === 'ios'
  );

  console.log('[Auth] handleGoogleLogin invoked. isNative:', isNative, 'platform:', Capacitor.getPlatform());

  if (isNative) {
    console.log('[Auth] Native platform confirmed. Awaiting bridge readiness...');
    await waitForBridgeReady();

    try {
      console.log('[Auth] Invoking FirebaseAuthentication.signInWithGoogle()...');
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log('[Auth] Native account prompt responded successfully.');

      const idToken = result?.credential?.idToken || (result as any)?.idToken;
      if (!idToken) {
        throw new Error('Native Google sign-in succeeded but returned no idToken verification signature.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential;
    } catch (error: any) {
      console.error('[Auth] Native Google Sign-In error:', error);
      alert(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  }

  // Standard Web Browser flow
  try {
    console.log('[Auth] Running outside native app context. Initiating standard web signInWithPopup...');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    console.log('[Auth] Google sign-in successful for user:', userCredential.user.email);
    return userCredential;
  } catch (error: any) {
    console.error('[Auth] Web Google sign-in error:', error);
    throw error;
  }
};
