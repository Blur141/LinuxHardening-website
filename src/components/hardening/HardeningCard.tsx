'use client';

import { useState } from 'react';
import type { HardeningItem } from '@/types';
import { CodeBlock } from './CodeBlock';
import { SeverityBadge } from './SeverityBadge';
import { CopyButton } from './CopyButton';
import {
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiInfo,
  FiFile, FiTerminal, FiRefreshCw, FiCheckCircle,
  FiRotateCcw, FiGitBranch
} from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface HardeningCardProps {
  item: HardeningItem;
  defaultOpen?: boolean;
}

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

export function HardeningCard({ item, defaultOpen = false }: HardeningCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={item.id}
      className={cn(
        'group rounded-xl border transition-all duration-200',
        open
          ? 'border-border bg-card shadow-lg shadow-black/10'
          : 'border-border/50 bg-card/50 hover:border-border hover:bg-card'
      )}
    >
      {/* Card header - always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <SeverityBadge severity={item.severity} />
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-muted-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="shrink-0 mt-1 text-muted-foreground">
          {open ? (
            <FiChevronUp className="h-4 w-4" />
          ) : (
            <FiChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-border/50 px-5 pb-5 pt-4 flex flex-col gap-5">
          {/* Why it's important */}
          <div className="flex gap-3 rounded-lg bg-blue-500/8 border border-blue-500/15 p-4">
            <FiInfo className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-400 mb-1">Why This Matters</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.importance}</p>
            </div>
          </div>

          {/* Config file + backup */}
          {item.configFile && (
            <Section icon={FiFile} title="Configuration File">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <code className="text-sm font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 truncate">
                    {item.configFile}
                  </code>
                  <CopyButton text={item.configFile} />
                </div>
                {item.backupCommand && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Backup:</span>
                    <CopyButton text={item.backupCommand} size="md" />
                  </div>
                )}
              </div>
              {item.backupCommand && item.backupCommand !== 'N/A — creating new file' && (
                <CodeBlock
                  code={item.backupCommand}
                  label="backup command"
                  language="bash"
                />
              )}
            </Section>
          )}

          {/* Recommended configuration */}
          {item.recommendedConfig && (
            <Section icon={FiFile} title="Recommended Configuration">
              <CodeBlock
                code={item.recommendedConfig}
                label={item.configFile ?? 'config'}
                language="conf"
                numbered
              />
            </Section>
          )}

          {/* Apply commands */}
          {item.applyCommands.length > 0 && (
            <Section icon={FiTerminal} title="Commands to Apply">
              <CodeBlock
                code={item.applyCommands}
                label="apply"
                language="bash"
                numbered
              />
            </Section>
          )}

          {/* Restart commands */}
          {item.restartCommands && item.restartCommands.length > 0 && (
            <Section icon={FiRefreshCw} title="Restart Service">
              <CodeBlock
                code={item.restartCommands}
                label="restart"
                language="bash"
              />
            </Section>
          )}

          {/* Verification */}
          {item.verificationCommands.length > 0 && (
            <Section icon={FiCheckCircle} title="Verification">
              <CodeBlock
                code={item.verificationCommands}
                label="verify"
                language="bash"
              />
            </Section>
          )}

          {/* Rollback */}
          {item.rollbackInstructions && item.rollbackInstructions.length > 0 && (
            <Section icon={FiRotateCcw} title="Rollback Instructions">
              <div className="flex gap-3 rounded-lg bg-orange-500/8 border border-orange-500/15 p-3 mb-2">
                <FiAlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-300/80">
                  Ensure you have a working alternative access method before rolling back SSH changes.
                </p>
              </div>
              <CodeBlock
                code={item.rollbackInstructions}
                label="rollback"
                language="bash"
              />
            </Section>
          )}

          {/* Version differences */}
          {item.versionDifferences && item.versionDifferences.length > 0 && (
            <Section icon={FiGitBranch} title="Version-Specific Differences">
              <div className="flex flex-col gap-3">
                {item.versionDifferences.map((diff, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/40">
                      <FiGitBranch className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">{diff.version}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-muted-foreground mb-2">{diff.notes}</p>
                      {diff.commands && diff.commands.length > 0 && (
                        <CodeBlock code={diff.commands} language="bash" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
