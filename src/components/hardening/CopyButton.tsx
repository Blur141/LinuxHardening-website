'use client';

import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, className, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded transition-all',
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm',
        copied
          ? 'bg-green-500/15 text-green-400'
          : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80',
        className
      )}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <FiCheck className="h-3 w-3" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <FiCopy className="h-3 w-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
