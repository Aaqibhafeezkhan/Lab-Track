import { useLocation } from "preact-iso";
import { useCurrentUser } from "../lib/currentUser";
import { logout } from "../lib/auth";
import { useState } from "preact/hooks";


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
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, role } = useCurrentUser();
  const { path } = useLocation();
  const nav = role === "admin" ? adminNav : studentNav;
  const isActive = (href) => (href === "/admin" ? path === href : path.startsWith(href));

  if (path === "/login") return <>{children}</>; 
  
  return (
    <div class="layout">
      <header class="layout-header">
        <button class="hamburger" onClick={() => setMenuOpen(true)}>
          ☰
        </button>
        <strong>Lab Track</strong>
        <nav class="top-nav">
          {nav.map((n) => (
            <a key={n.href} href={n.href} class={isActive(n.href) ? "active" : ""}>
              {n.label}
            </a>
          ))}
        </nav>
        {user && (
          <button class="btn-link" onClick={logout}>
            Sign out
          </button>
        )}
      </header>

      {menuOpen && (
        <>
          <div
            class="drawer-backdrop"
            onClick={() => setMenuOpen(false)}
          />

          <aside class="drawer">
            <button
              class="drawer-close"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>

            <nav class="drawer-nav">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  class={isActive(n.href) ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </aside>
        </>
      )}


      <main class="layout-main">{children}</main>

      
    </div>
  );
}