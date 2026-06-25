import { FiShield } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-background/50">
      <div className="mx-auto max-w-screen-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FiShield className="h-4 w-4" />
          <span>Linux Hardening Guide — Reference only. Never connects to your systems.</span>
        </div>
        <p className="text-xs text-muted-foreground/60">
          Always test in a staging environment before applying to production.
        </p>
      </div>
    </footer>
  );
}
