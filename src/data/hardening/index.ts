import type { CategoryData } from '@/types';
import type { Distribution } from '@/types';

import { getSshData } from './ssh';
import { getAuditdData } from './auditd';
import { getFail2banData } from './fail2ban';
import { getSysctlData } from './sysctl';
import { getFirewallData } from './firewall';
import { getSelinuxData } from './selinux';
import { getPasswordData } from './password';
import { getPamData } from './pam';
import { getUserSecurityData } from './user-security';
import { getLoggingData } from './logging';
import { getFilesystemData } from './filesystem';
import { getNetworkData } from './network';
import { getCronData } from './cron';
import { getNtpData } from './ntp';

type DataFn = (family: string) => ReturnType<typeof getSshData>;

const categoryDataMap: Record<string, DataFn> = {
  ssh: getSshData,
  auditd: getAuditdData,
  fail2ban: getFail2banData,
  sysctl: getSysctlData,
  firewall: getFirewallData,
  selinux: getSelinuxData,
  password: getPasswordData,
  pam: getPamData,
  'user-security': getUserSecurityData,
  logging: getLoggingData,
  filesystem: getFilesystemData,
  network: getNetworkData,
  cron: getCronData,
  ntp: getNtpData,
};

const categoryMeta: Record<string, { title: string; description: string }> = {
  ssh: { title: 'SSH Hardening', description: 'Secure Shell daemon configuration to prevent unauthorized remote access.' },
  auditd: { title: 'Auditd', description: 'Linux Audit Daemon rules for comprehensive system-call and file-access logging.' },
  fail2ban: { title: 'Fail2Ban', description: 'Intrusion prevention by automatically banning IPs after repeated failures.' },
  sysctl: { title: 'Sysctl Hardening', description: 'Kernel parameter tuning for network, memory, and system security.' },
  firewall: { title: 'Firewall Configuration', description: 'Packet filtering and network access control rules.' },
  selinux: { title: 'SELinux / AppArmor', description: 'Mandatory Access Control for process and file isolation.' },
  password: { title: 'Password Policies', description: 'Enforce strong passwords, aging, and complexity requirements.' },
  pam: { title: 'PAM Configuration', description: 'Pluggable Authentication Modules for granular login controls.' },
  'user-security': { title: 'User Security', description: 'User account hardening, privilege management, and sudo controls.' },
  logging: { title: 'Logging', description: 'System and application logging configuration, forwarding, and retention.' },
  filesystem: { title: 'File System Security', description: 'Mount options, permissions, SUID auditing, and file integrity.' },
  network: { title: 'Network Security', description: 'Network service hardening, protocol restrictions, and DNS security.' },
  cron: { title: 'Cron Security', description: 'Scheduled task access control and crontab auditing.' },
  ntp: { title: 'NTP Security', description: 'Time synchronization hardening and server authentication.' },
};

export function getCategoryData(
  categoryId: string,
  distro: Distribution
): CategoryData {
  const fn = categoryDataMap[categoryId];
  const meta = categoryMeta[categoryId];

  if (!fn || !meta) {
    return {
      id: categoryId,
      title: categoryId,
      description: '',
      items: [],
    };
  }

  return {
    id: categoryId,
    title: meta.title,
    description: meta.description,
    items: fn(distro.family),
  };
}

export function searchAllCategories(
  query: string,
  distro: Distribution
): Array<{ categoryId: string; categoryTitle: string; items: CategoryData['items'] }> {
  const q = query.toLowerCase();
  const results: Array<{ categoryId: string; categoryTitle: string; items: CategoryData['items'] }> = [];

  for (const [categoryId, fn] of Object.entries(categoryDataMap)) {
    const meta = categoryMeta[categoryId];
    const items = fn(distro.family).filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.importance.toLowerCase().includes(q)
    );
    if (items.length > 0) {
      results.push({ categoryId, categoryTitle: meta.title, items });
    }
  }

  return results;
}
