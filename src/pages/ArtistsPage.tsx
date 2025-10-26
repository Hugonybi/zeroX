import { Button } from "../components/ui/Button";

export function ArtistsPage() {
  return (
    <section className="space-y-6">
      <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Coming soon</p>
      <h2 className="font-brand text-4xl uppercase tracking-[0.15em]">Artist onboarding & dashboard</h2>
      <p className="max-w-xl text-sm text-ink-muted">
        Artists will create listings, upload media, and monitor sales from this workspace. Once authentication and onboarding APIs land, this view will split into profile setup, artwork manager, and order insights tabs.
      </p>
      <Button variant="secondary" disabled>
        Request early access
      </Button>
    </section>
  );
}
