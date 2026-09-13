import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const pluginAvailable = typeof window !== 'undefined' && Capacitor.isPluginAvailable('FirebaseAuthentication');

  console.log('[Auth] handleGoogleLogin invoked. isNative:', isNative, 'pluginAvailable:', pluginAvailable, 'platform:', Capacitor.getPlatform());

  try {
    if (isNative && pluginAvailable) {
      console.log('[Auth] Native platform & FirebaseAuthentication plugin available. Calling signInWithGoogle()...');
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log('[Auth] Native signInWithGoogle response:', JSON.stringify(result));

      const idToken = result?.credential?.idToken;
      console.log('[Auth] Native ID Token exists:', Boolean(idToken));

      if (!idToken) {
        throw new Error('Native Google Sign-In succeeded, but no ID token was returned in credential.');
      }

      console.log('[Auth] Creating GoogleAuthProvider credential from ID token...');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      console.log('[Auth] Firebase web session successfully established for:', userCredential.user.email);
      return userCredential;
    }

    if (isNative && !pluginAvailable) {
      const debugMsg = 'Capacitor plugin "FirebaseAuthentication" is not available in this native Android build. Please rebuild and reinstall the APK after running "npx cap sync android".';
      console.warn('[Auth] ' + debugMsg);
      if (typeof window !== 'undefined') {
        alert(
          'FirebaseAuthentication plugin not found in this Android APK.\n\n' +
          'Action: Please rebuild and install the Android app via Android Studio after running "npx cap sync android".\n\n' +
          'Falling back to web sign-in now...'
        );
      }
    }

    // Standard browser environment or fallback when native plugin is unavailable
    console.log('[Auth] Executing web Google Sign-In via signInWithPopup...');
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    console.log('[Auth] Web signInWithPopup completed for:', userCredential.user.email);
    return userCredential;
  } catch (error: any) {
    console.error('[Auth] Google Sign-In failed with exception:', error);
    console.error('[Auth] Error message:', error?.message || error);
    console.error('[Auth] Error code:', error?.code);
    console.error('[Auth] Error stack:', error?.stack);

    // Force any hidden native bridge rejections (DEVELOPER_ERROR, API_EXCEPTION, etc.) to pop up physically on Android
    if (typeof window !== 'undefined' && !(error as any)?._alerted) {
      (error as any)._alerted = true;
      try {
        const serialized = JSON.stringify(error);
        if (serialized && serialized !== '{}') {
          alert(serialized);
        } else {
          alert(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
      } catch {
        alert(String(error?.message || error));
      }
    }
    throw error;
  }
};
