import type { Severity } from '@/types';
import { cn } from '@/lib/utils';

const severityConfig: Record<Severity, { label: string; className: string }> = {
  critical: {
    label: 'Critical',
    className: 'bg-red-500/15 text-red-400 border-red-500/20',
  },
  high: {
    label: 'High',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  },
  medium: {
    label: 'Medium',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  },
  low: {
    label: 'Low',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
