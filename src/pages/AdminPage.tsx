import { Button } from "../components/ui/Button";

export function AdminPage() {
  return (
    <section className="space-y-6">
      <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Admin tooling preview</p>
      <h2 className="font-brand text-4xl uppercase tracking-[0.15em]">Moderation & mint oversight</h2>
      <p className="max-w-xl text-sm text-ink-muted">
        The admin console will surface submission queues, payment statuses, and mint retries. As backend endpoints are finalized, we will add data tables, filters, and remediation actions here.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" disabled>
          View submissions
        </Button>
        <Button disabled>
          Mint queue
        </Button>
      </div>
    </section>
  );
}
