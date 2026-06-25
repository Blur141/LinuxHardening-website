'use client';

import { useMemo, useState } from 'react';
import type { CategoryData } from '@/types';
import { HardeningCard } from './HardeningCard';
import { SearchBar } from '../search/SearchBar';
import { FiAlertTriangle, FiBook, FiFilter } from 'react-icons/fi';
import type { Severity } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryViewProps {
  data: CategoryData;
  distroName: string;
  versionName: string;
}

const severities: Severity[] = ['critical', 'high', 'medium', 'low'];
const severityColors: Record<Severity, string> = {
  critical: 'text-red-400 border-red-500/30 bg-red-500/10 data-[active=true]:bg-red-500/20',
  high: 'text-orange-400 border-orange-500/30 bg-orange-500/10 data-[active=true]:bg-orange-500/20',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 data-[active=true]:bg-yellow-500/20',
  low: 'text-blue-400 border-blue-500/30 bg-blue-500/10 data-[active=true]:bg-blue-500/20',
};

export function CategoryView({ data, distroName, versionName }: CategoryViewProps) {
  const [search, setSearch] = useState('');
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(new Set());

  const toggleSeverity = (sev: Severity) => {
    setActiveSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(sev)) {
        next.delete(sev);
      } else {
        next.add(sev);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    let items = data.items;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.importance.toLowerCase().includes(q)
      );
    }
    if (activeSeverities.size > 0) {
      items = items.filter((item) => activeSeverities.has(item.severity));
    }
    return items;
  }, [data.items, search, activeSeverities]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const item of data.items) c[item.severity] = (c[item.severity] ?? 0) + 1;
    return c;
  }, [data.items]);

  return (
    <div className="flex flex-col gap-6">
      {/* Category header */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground/60">
              {distroName} · {versionName}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2">
          {severities.map((sev) =>
            counts[sev] ? (
              <button
                key={sev}
                data-active={activeSeverities.has(sev)}
                onClick={() => toggleSeverity(sev)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-all',
                  severityColors[sev]
                )}
              >
                <span className="capitalize">{sev}</span>
                <span className="font-mono opacity-70">{counts[sev]}</span>
              </button>
            ) : null
          )}
          <div className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
            <FiBook className="h-3.5 w-3.5" />
            <span>{data.items.length} checks</span>
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2">
        <SearchBar
          value={search}
          onChange={setSearch}
          resultCount={search || activeSeverities.size > 0 ? filtered.length : undefined}
          className="flex-1"
        />
        {activeSeverities.size > 0 && (
          <button
            onClick={() => setActiveSeverities(new Set())}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiFilter className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FiAlertTriangle className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No hardening checks match your search.
          </p>
          <button
            onClick={() => { setSearch(''); setActiveSeverities(new Set()); }}
            className="text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <HardeningCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
