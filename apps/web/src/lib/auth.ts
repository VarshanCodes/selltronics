import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential, type UserCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential | undefined> => {
  try {
    // Force the native Android Google Sign-In prompt
    const result = await FirebaseAuthentication.signInWithGoogle();

    // Pass the native token into your Firebase web session
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error("No ID token returned");

    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};
