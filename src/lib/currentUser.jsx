import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { watchAuth, finishRedirectLogin } from "./auth";

const CurrentUserContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
});

export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  // 1. Who is signed in?
  useEffect(() => {
    return watchAuth((u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) {
        setProfile(null);
        setProfileReady(true);
      } else {
        setProfileReady(false);
      }
      finishRedirectLogin();
    });
  }, []);

  // 2. What does their profile (and role) say? Live, so it updates right after
  //    loginWithGoogle() creates the document on first login.
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        setProfile(snap.exists() ? snap.data() : null);
        setProfileReady(true);
      },
      (err) => {
        console.error(err);
        setProfileReady(true);
      }
    );
  }, [user]);

  const value = {
    user,
    profile,
    role: profile?.role ?? (user ? "student" : null),
    loading: !authReady || !profileReady,
  };

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}