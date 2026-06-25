'use client';

import type { DistroId, CategoryId } from '@/types';
import { distributions } from '@/data/distributions';
import { categories } from '@/data/categories';
import {
  FiShield, FiLock, FiSearch, FiAlertCircle, FiSliders,
  FiUser, FiFileText, FiFolder, FiClock, FiWatch,
  FiWifi, FiKey, FiArrowRight, FiTerminal, FiDatabase
} from 'react-icons/fi';
import {
  SiRedhat, SiRockylinux, SiAlmalinux, SiFedora,
  SiUbuntu, SiDebian, SiArchlinux
} from 'react-icons/si';
import { cn } from '@/lib/utils';

const distroIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  oracle: FiDatabase,
  rhel: SiRedhat,
  rocky: SiRockylinux,
  alma: SiAlmalinux,
  fedora: SiFedora,
  ubuntu: SiUbuntu,
  debian: SiDebian,
  arch: SiArchlinux,
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ssh: FiLock,
  auditd: FiSearch,
  fail2ban: FiAlertCircle,
  sysctl: FiSliders,
  firewall: FiShield,
  selinux: FiShield,
  password: FiKey,
  pam: FiShield,
  'user-security': FiUser,
  logging: FiFileText,
  filesystem: FiFolder,
  network: FiWifi,
  cron: FiClock,
  ntp: FiWatch,
};

const distroColors: Record<string, string> = {
  oracle: 'hover:border-red-500/40 hover:bg-red-500/5',
  rhel: 'hover:border-red-500/40 hover:bg-red-500/5',
  rocky: 'hover:border-green-500/40 hover:bg-green-500/5',
  alma: 'hover:border-blue-500/40 hover:bg-blue-500/5',
  fedora: 'hover:border-blue-400/40 hover:bg-blue-400/5',
  ubuntu: 'hover:border-orange-500/40 hover:bg-orange-500/5',
  debian: 'hover:border-pink-500/40 hover:bg-pink-500/5',
  arch: 'hover:border-cyan-500/40 hover:bg-cyan-500/5',
};

interface WelcomeScreenProps {
  onDistroSelect: (id: DistroId) => void;
  onQuickStart: (distroId: DistroId, categoryId: CategoryId) => void;
}

const quickStartItems: Array<{ distroId: DistroId; categoryId: CategoryId; label: string }> = [
  { distroId: 'ubuntu', categoryId: 'ssh', label: 'Ubuntu SSH Hardening' },
  { distroId: 'rhel', categoryId: 'selinux', label: 'RHEL SELinux Setup' },
  { distroId: 'debian', categoryId: 'firewall', label: 'Debian UFW Config' },
  { distroId: 'rocky', categoryId: 'auditd', label: 'Rocky Linux Auditd' },
  { distroId: 'fedora', categoryId: 'sysctl', label: 'Fedora Sysctl Tuning' },
  { distroId: 'arch', categoryId: 'firewall', label: 'Arch nftables Setup' },
];

export function WelcomeScreen({ onDistroSelect, onQuickStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col gap-10 py-4">
      {/* Hero */}
      <div className="text-center flex flex-col items-center gap-4 pt-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20">
          <FiShield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Linux Hardening Guide
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A comprehensive reference for hardening Linux distributions. Select a distro
            and category to view copy-paste ready commands, configuration files, and
            verification steps.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/8 px-3 py-2 text-sm text-green-400">
          <FiTerminal className="h-4 w-4 shrink-0" />
          <span>Reference guide only — never connects to or modifies your systems.</span>
        </div>
      </div>

      {/* Distributions */}
      <section id="distributions">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Choose a Distribution
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {distributions.map((distro) => {
            const Icon = distroIcons[distro.id] ?? FiShield;
            return (
              <button
                key={distro.id}
                onClick={() => onDistroSelect(distro.id as DistroId)}
                className={cn(
                  'group flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-5 transition-all',
                  'hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5',
                  distroColors[distro.id]
                )}
              >
                <Icon className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{distro.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {distro.versions.length} version{distro.versions.length > 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick start */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickStartItems.map((qs) => {
            const distro = distributions.find((d) => d.id === qs.distroId)!;
            const DistroIcon = distroIcons[qs.distroId] ?? FiShield;
            const CatIcon = categoryIcons[qs.categoryId] ?? FiShield;
            return (
              <button
                key={`${qs.distroId}-${qs.categoryId}`}
                onClick={() => onQuickStart(qs.distroId, qs.categoryId)}
                className="group flex items-center gap-3 rounded-lg border border-border/40 bg-card/30 px-4 py-3 text-left transition-all hover:border-border hover:bg-card"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <DistroIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{qs.label}</p>
                  <p className="text-xs text-muted-foreground">{distro.name}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <CatIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <FiArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section id="categories">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Hardening Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] ?? FiShield;
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/20 px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
