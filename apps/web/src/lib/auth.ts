import { GoogleAuthProvider, signInWithPopup, type UserCredential } from 'firebase/auth';
import { auth } from '@/firebase';

export const handleGoogleLogin = async (): Promise<UserCredential> => {
  console.log('[Auth] Initiating standard web Google Sign-In via Firebase Auth...');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const userCredential = await signInWithPopup(auth, provider);
  console.log('[Auth] Google sign-in successful for user:', userCredential.user.email);
  return userCredential;
};
