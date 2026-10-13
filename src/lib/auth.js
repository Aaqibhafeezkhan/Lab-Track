// src/lib/auth.js
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const provider = new GoogleAuthProvider();

// Sign in with Google, then make sure this person has a profile in Firestore.
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const profileRef = doc(db, "users", user.uid);
  const snap = await getDoc(profileRef);

  // Only create the profile the first time. Students aren't allowed to
  // update it, so writing again on a later login would be denied.
  if (!snap.exists()) {
    await setDoc(profileRef, {
      email: user.email,
      name: user.displayName,
      role: "student", // the rules require exactly this on creation
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

export function logout() {
  return signOut(auth);
}

// Lets a component hear about login/logout. Returns a function that stops listening.
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}