import { NavLink, type NavLinkRenderProps } from "react-router-dom";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";

export function Sidebar() {
  return (
    <aside className="flex w-full max-w-xs flex-col gap-8">
      <div className="space-y-4">
        <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-charcoal/10 bg-white shadow-brand">
          <span className="font-brand text-4xl text-ink">◊</span>
        </div>
        <div className="space-y-1">
          <h1 className="font-brand text-2xl uppercase tracking-wide">zero X</h1>
          <p className="text-sm text-ink-muted">A place of art, lorem dosum ipsum dotem</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">Buy Now</Button>
        <Button variant="secondary" className="flex-1">
          Feature
        </Button>
      </div>

      <nav className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-ink-muted">
        {[
          { to: "/", label: "Browse" },
          { to: "/artists", label: "Artists" },
          { to: "/admin", label: "Admin" },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }: NavLinkRenderProps) =>
              `rounded-pill px-4 py-2 transition-colors duration-200 ${isActive ? "bg-mint-soft text-ink" : "hover:bg-charcoal/5"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3">
        <TextField placeholder="Search" />
        <TextField placeholder="Something I'd love" />
      </div>
    </aside>
  );
}
