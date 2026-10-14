import { useLocation } from "preact-iso";
import { useCurrentUser } from "../lib/currentUser";
import { logout } from "../lib/auth";

const studentNav = [
  { href: "/borrow", label: "Borrow" },
  { href: "/slips", label: "My slips" },
];
const adminNav = [
  { href: "/admin", label: "Slips" },
  { href: "/admin/out", label: "Out now" },
  { href: "/admin/catalog", label: "Catalog" },
];

export function Layout({ children }) {
  const { user, role } = useCurrentUser();
  const { path } = useLocation();
  const nav = role === "admin" ? adminNav : studentNav;
  const isActive = (href) => (href === "/admin" ? path === href : path.startsWith(href));

  return (
    <div class="layout">
      <header class="layout-header">
        <strong>Lab Borrow</strong>
        {user && (
          <button class="btn-link" onClick={logout}>
            Sign out
          </button>
        )}
      </header>

      <main class="layout-main">{children}</main>

      {user && (
        <nav class="bottom-nav">
          {nav.map((n) => (
            <a href={n.href} class={isActive(n.href) ? "active" : ""}>
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}