'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiShield, FiSun, FiMoon, FiGithub, FiMenu, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export function Header({ onMenuToggle, menuOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 sm:px-6">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FiShield className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block font-bold text-sm tracking-tight">
              Linux Hardening Guide
            </span>
            <span className="sm:hidden font-bold text-sm">LHG</span>
            <Badge variant="secondary" className="hidden sm:flex text-[10px] px-1.5 py-0 font-mono">
              v1.0
            </Badge>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Guide
          </Link>
          <Link
            href="/#distributions"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Distributions
          </Link>
          <Link
            href="/#categories"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Categories
          </Link>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/Blur141/LinuxHardening-website"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <FiGithub className="h-4.5 w-4.5" />
          </a>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun className="h-4.5 w-4.5" />
              ) : (
                <FiMoon className="h-4.5 w-4.5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
