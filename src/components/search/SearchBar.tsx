'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  resultCount?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search hardening checks...',
  className,
  resultCount,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: / to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        onChange('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onChange]);

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <FiSearch className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full rounded-lg border border-border/60 bg-background/60',
          'pl-9 pr-20 text-sm text-foreground placeholder:text-muted-foreground',
          'outline-none ring-0 transition-all',
          'focus:border-primary/60 focus:bg-background focus:ring-1 focus:ring-primary/20',
          'hover:border-border'
        )}
      />
      <div className="absolute inset-y-0 right-3 flex items-center gap-2">
        {value && (
          <button
            onClick={() => onChange('')}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
        )}
        {!value && (
          <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            /
          </kbd>
        )}
        {resultCount !== undefined && (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {resultCount} found
          </span>
        )}
      </div>
    </div>
  );
}
