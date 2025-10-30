import { Link, NavLink } from "react-router-dom";
import { Badge } from "./ui/Badge";
import { useAuth } from "../features/auth/hooks";

const publicLinks = [
  { to: "/", label: "Store" },
];

const authenticatedLinks = [
  { to: "/", label: "Store" },
  { to: "/profile", label: "Profile" },
  { to: "/artists", label: "Post Artwork", roles: ['artist'] as string[] },
];

export function SiteHeader() {
  const { user, isAuthenticated, signOut } = useAuth();

  const getVisibleLinks = () => {
    if (!isAuthenticated || !user) return publicLinks;

    return authenticatedLinks.filter(link => 
      !link.roles || link.roles.includes(user.role)
    );
  };

  const links = getVisibleLinks();

  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-charcoal/20 bg-white font-brand text-2xl">
            ◊
          </span>
          <span className="font-brand text-xl lowercase tracking-[0.3em]">zeroXmods</span>
        </Link>
              {/* search bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 ">
        <label className="flex flex-1 max-w-xl items-center text-xs uppercase tracking-[0.35em] text-ink">
          <span className="sr-only">Search artworks</span>
          <input
            type="search"
            placeholder="search"
            className="w-full border-b border-charcoal/40 bg-transparent pb-1 text-xs uppercase tracking-[0.35em] text-ink placeholder:text-charcoal/50 focus:border-ink focus:outline-none"
          />
        </label>

        <button
          type="button"
          className="text-xs uppercase tracking-[0.35em] text-ink hover:text-emerald-500"
        >
          Filter
        </button>
      </div>
        <nav className="flex flex-wrap items-center gap-8 text-xs font-semibold uppercase tracking-[0.35em] text-ink-muted">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `transition-colors duration-200 ${isActive ? "text-ink" : "hover:text-ink"}`
              }
            >
              {label}
            </NavLink>
          ))}

          <span className="hidden h-3 w-px bg-charcoal/20 sm:inline" aria-hidden="true" />

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink">
                  Welcome, {user?.name}
                </span>
                <Badge tone={user?.role === 'admin' ? 'success' : user?.role === 'artist' ? 'info' : 'neutral'}>
                  <span className="capitalize text-[10px]">{user?.role}</span>
                </Badge>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="text-xs font-semibold lowercase tracking-[0.25em] text-red-500 hover:text-red-700"
              >
                logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="text-xs font-semibold lowercase tracking-[0.25em] text-violet-500 hover:text-violet-700"
              >
                sign up
              </Link>
              <Link
                to="/login"
                className="text-xs font-semibold lowercase tracking-[0.25em] text-emerald-500 hover:text-emerald-700"
              >
                login
              </Link>
            </>
          )}
        </nav>
      </div>

    </header>
  );
}
