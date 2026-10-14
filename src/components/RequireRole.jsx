import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { useCurrentUser } from "../lib/currentUser";

// <RequireRole>            -> any signed-in user
// <RequireRole role="admin"> -> admins only
export function RequireRole({ role, children }) {
  const { user, role: myRole, loading } = useCurrentUser();
  const { route } = useLocation();
  const allowed = !!user && (!role || myRole === role);

  useEffect(() => {
    if (loading) return;
    if (!user) route("/login");
    else if (!allowed) route("/");
  }, [loading, user, allowed]);

  if (loading) return <p>Loading...</p>;
  return allowed ? children : null;
}