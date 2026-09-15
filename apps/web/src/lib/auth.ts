import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/firebase';

/**
 * Asynchronous bridge-ready check before invoking native plugins in hybrid mobile apps.
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
  // Strict Web vs. Native Isolation:
  // Standard web browsers (Desktop, iOS Safari, Android Chrome) must never execute native bridge code.
  // Guard all @capacitor/* and @capacitor-firebase/* imports and invocations behind runtime checks.
  if (typeof window !== 'undefined') {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        console.log('[Auth] Native platform confirmed via Capacitor.isNativePlatform(). Awaiting bridge readiness...');
        await waitForBridgeReady();

        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        console.log('[Auth] Invoking native FirebaseAuthentication.signInWithGoogle()...');
        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log('[Auth] Native account prompt responded successfully.');

        const idToken = result?.credential?.idToken || (result as any)?.idToken;
        if (!idToken) {
          throw new Error('Native Google sign-in succeeded but returned no idToken verification signature.');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential;
      }
    } catch (nativeError) {
      console.warn('[Auth] Native check or native auth bypassed, continuing with Web SDK:', nativeError);
    }
  }

  // Standard Web Browser flow (Desktop, iOS Safari, Android Chrome)
  try {
    console.log('[Auth] Running in standard web browser context. Initiating Firebase Web SDK signInWithPopup...');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    console.log('[Auth] Web Google sign-in successful for user:', userCredential.user.email);
    return userCredential;
  } catch (error: any) {
    console.error('[Auth] Web Google sign-in error:', error);
    throw error;
  }
};

