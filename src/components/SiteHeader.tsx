import { Link, NavLink } from "react-router-dom";

const primaryLinks = [
  { to: "/", label: "Store" },
  { to: "/artists", label: "Profile" },
];

export function SiteHeader() {
  return (
    <header className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-charcoal/20 bg-white font-brand text-2xl">
            ◊
          </span>
          <span className="font-brand text-xl lowercase tracking-[0.3em]">zeroXmods</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-8 text-xs font-semibold uppercase tracking-[0.35em] text-ink-muted">
          {primaryLinks.map(({ to, label }) => (
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

          <button type="button" className="text-xs font-semibold lowercase tracking-[0.25em] text-violet-500">
            sign up
          </button>
          <button type="button" className="text-xs font-semibold lowercase tracking-[0.25em] text-emerald-500">
            login
          </button>
        </nav>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-charcoal/10 pt-6">
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
    </header>
  );
}
