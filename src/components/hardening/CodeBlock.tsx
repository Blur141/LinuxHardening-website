'use client';

import { CopyButton } from './CopyButton';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string | string[];
  label?: string;
  language?: 'bash' | 'conf' | 'text';
  className?: string;
  numbered?: boolean;
}

function tokenizeLine(line: string, language: string): React.ReactNode {
  if (language === 'bash') {
    // Comment
    if (line.trimStart().startsWith('#')) {
      return <span className="text-zinc-500">{line}</span>;
    }
    // Highlight sudo, common commands
    const parts = line.split(
      /(\bsudo\b|\bsystemctl\b|\bapt\b|\bdnf\b|\byum\b|\bpacman\b|\bgrep\b|\bsed\b|\becho\b|\bcat\b|\bchmod\b|\bchown\b|\bufw\b|\bfirewall-cmd\b|\bnft\b|\bsemanage\b|\bauditctl\b|\bfail2ban-client\b)/g
    );
    return (
      <>
        {parts.map((p, i) =>
          /^(sudo|systemctl|apt|dnf|yum|pacman|grep|sed|echo|cat|chmod|chown|ufw|firewall-cmd|nft|semanage|auditctl|fail2ban-client)$/.test(p) ? (
            <span key={i} className="text-blue-400">{p}</span>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </>
    );
  }
  if (language === 'conf') {
    if (line.trimStart().startsWith('#')) {
      return <span className="text-zinc-500">{line}</span>;
    }
    const eqIdx = line.indexOf('=');
    const spIdx = line.indexOf(' ');
    const sep = eqIdx !== -1 && (spIdx === -1 || eqIdx < spIdx) ? eqIdx : spIdx;
    if (sep > 0) {
      return (
        <>
          <span className="text-teal-400">{line.slice(0, sep)}</span>
          <span className="text-zinc-400">{line.slice(sep, sep + 1)}</span>
          <span className="text-orange-300">{line.slice(sep + 1)}</span>
        </>
      );
    }
  }
  return line;
}

export function CodeBlock({
  code,
  label,
  language = 'bash',
  className,
  numbered = false,
}: CodeBlockProps) {
  const lines = Array.isArray(code) ? code : code.split('\n');
  const fullText = lines.join('\n');

  return (
    <div className={cn('group rounded-lg border border-border/60 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-zinc-900/60 px-3 py-1.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>
          {label && (
            <span className="text-[11px] text-muted-foreground font-mono">{label}</span>
          )}
        </div>
        <CopyButton text={fullText} />
      </div>

      {/* Code */}
      <div className="overflow-x-auto bg-zinc-950/80">
        <pre className="p-4 text-[13px] leading-relaxed font-mono text-zinc-200">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {numbered && (
                <span className="select-none w-8 shrink-0 text-right mr-4 text-zinc-600 text-xs pt-px">
                  {i + 1}
                </span>
              )}
              <span>{tokenizeLine(line, language)}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
