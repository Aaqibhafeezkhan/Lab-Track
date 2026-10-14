import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { useCurrentUser } from "../lib/currentUser";

// "/" just sends people to the right place.
export function Home() {
  const { user, role, loading } = useCurrentUser();
  const { route } = useLocation();

  useEffect(() => {
    if (loading) return;
    route(!user ? "/login" : role === "admin" ? "/admin" : "/borrow");
  }, [loading, user, role]);

  return <p>Loading...</p>;
}