'use client';

import { categories } from '@/data/categories';
import { distributions } from '@/data/distributions';
import type { CategoryId, DistroId } from '@/types';
import { cn } from '@/lib/utils';
import {
  FiLock, FiSearch, FiShield, FiSliders, FiWifi,
  FiUser, FiFileText, FiFolder, FiClock, FiWatch,
  FiAlertCircle, FiActivity, FiKey, FiDatabase
} from 'react-icons/fi';
import {
  SiRedhat, SiRockylinux, SiAlmalinux, SiFedora,
  SiUbuntu, SiDebian, SiArchlinux
} from 'react-icons/si';

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

interface SidebarProps {
  selectedDistro: DistroId | null;
  selectedVersion: string | null;
  selectedCategory: CategoryId | null;
  onDistroChange: (id: DistroId) => void;
  onVersionChange: (id: string) => void;
  onCategoryChange: (id: CategoryId) => void;
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  selectedDistro,
  selectedVersion,
  selectedCategory,
  onDistroChange,
  onVersionChange,
  onCategoryChange,
  mobile,
  onClose,
}: SidebarProps) {
  const currentDistro = distributions.find((d) => d.id === selectedDistro);

  return (
    <aside
      className={cn(
        'flex flex-col h-full overflow-y-auto',
        mobile ? 'w-full' : 'w-64 shrink-0'
      )}
    >
      <div className="flex flex-col gap-6 p-4">
        {/* Distribution selector */}
        <section>
          <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Distribution
          </h3>
          <div className="flex flex-col gap-0.5">
            {distributions.map((distro) => {
              const Icon = distroIcons[distro.id] ?? FiActivity;
              const isSelected = selectedDistro === distro.id;
              return (
                <button
                  key={distro.id}
                  onClick={() => {
                    onDistroChange(distro.id as DistroId);
                    if (mobile) onClose?.();
                  }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all text-left w-full',
                    isSelected
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{distro.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Version selector */}
        {currentDistro && (
          <section>
            <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Version
            </h3>
            <div className="flex flex-col gap-0.5">
              {currentDistro.versions.map((ver) => {
                const isSelected = selectedVersion === ver.id;
                return (
                  <button
                    key={ver.id}
                    onClick={() => {
                      onVersionChange(ver.id);
                      if (mobile) onClose?.();
                    }}
                    className={cn(
                      'flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-all text-left w-full',
                      isSelected
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <span className="truncate">
                      {ver.codename ? `${ver.name} (${ver.codename})` : ver.name}
                    </span>
                    {ver.eol && (
                      <span className="text-[9px] font-medium text-orange-500/80 bg-orange-500/10 px-1 py-0.5 rounded">
                        EOL
                      </span>
                    )}
                    {ver.lts && !ver.eol && (
                      <span className="text-[9px] font-medium text-green-500/80 bg-green-500/10 px-1 py-0.5 rounded">
                        LTS
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Category selector */}
        {selectedDistro && (
          <section>
            <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </h3>
            <div className="flex flex-col gap-0.5">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.id] ?? FiShield;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryChange(cat.id as CategoryId);
                      if (mobile) onClose?.();
                    }}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all text-left w-full',
                      isSelected
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
