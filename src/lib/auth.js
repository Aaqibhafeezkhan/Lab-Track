import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const provider = new GoogleAuthProvider();

// Sends the whole tab to Google. The page leaves, so nothing after this line runs.
export function loginWithGoogle() {
  return signInWithRedirect(auth, provider);
}

// First login only: create the users/{uid} profile. Never makes login "fail".
async function ensureProfile(user) {
  try {
    const profileRef = doc(db, "users", user.uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
      await setDoc(profileRef, {
        email: user.email,
        name: user.displayName,
        role: "student", // the rules require exactly this on creation
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Could not check/create profile:", err);
  }
}

// Call once when the app starts. If we just came back from Google, finish the login.
export async function finishRedirectLogin() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) await ensureProfile(result.user);
  } catch (err) {
    console.error("Redirect sign-in failed:", err);
  }
}

export function logout() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}