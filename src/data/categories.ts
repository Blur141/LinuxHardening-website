import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'ssh',
    name: 'SSH Hardening',
    description: 'Secure Shell daemon configuration to prevent unauthorized access',
    icon: 'MdLock',
    tags: ['access', 'remote', 'authentication'],
  },
  {
    id: 'auditd',
    name: 'Auditd',
    description: 'Linux Audit Daemon for system-call and file-access logging',
    icon: 'MdSearch',
    tags: ['audit', 'logging', 'compliance'],
  },
  {
    id: 'fail2ban',
    name: 'Fail2Ban',
    description: 'Intrusion prevention by banning IPs after repeated failures',
    icon: 'MdGavel',
    tags: ['brute-force', 'access', 'firewall'],
  },
  {
    id: 'sysctl',
    name: 'Sysctl Hardening',
    description: 'Kernel parameter tuning for network and system security',
    icon: 'MdTune',
    tags: ['kernel', 'network', 'system'],
  },
  {
    id: 'firewall',
    name: 'Firewall Configuration',
    description: 'Packet filtering and network access control rules',
    icon: 'MdFireExtinguisher',
    tags: ['network', 'access', 'firewalld', 'ufw', 'iptables'],
  },
  {
    id: 'selinux',
    name: 'SELinux / AppArmor',
    description: 'Mandatory Access Control for process and file isolation',
    icon: 'MdSecurity',
    tags: ['mac', 'selinux', 'apparmor', 'access'],
  },
  {
    id: 'password',
    name: 'Password Policies',
    description: 'Enforce strong passwords, aging, and complexity requirements',
    icon: 'MdPassword',
    tags: ['authentication', 'password', 'compliance'],
  },
  {
    id: 'pam',
    name: 'PAM Configuration',
    description: 'Pluggable Authentication Modules for granular login controls',
    icon: 'MdShield',
    tags: ['authentication', 'pam', 'login'],
  },
  {
    id: 'user-security',
    name: 'User Security',
    description: 'User account hardening, privilege management, and sudo controls',
    icon: 'MdPerson',
    tags: ['users', 'sudo', 'privilege'],
  },
  {
    id: 'logging',
    name: 'Logging',
    description: 'System and application logging configuration and retention',
    icon: 'MdDescription',
    tags: ['logging', 'syslog', 'journald'],
  },
  {
    id: 'filesystem',
    name: 'File System Security',
    description: 'Mount options, permissions, and file integrity controls',
    icon: 'MdFolder',
    tags: ['filesystem', 'permissions', 'integrity'],
  },
  {
    id: 'network',
    name: 'Network Security',
    description: 'Network service hardening, protocol restrictions, and DNS security',
    icon: 'MdNetworkCheck',
    tags: ['network', 'dns', 'protocols'],
  },
  {
    id: 'cron',
    name: 'Cron Security',
    description: 'Scheduled task access control and crontab auditing',
    icon: 'MdSchedule',
    tags: ['cron', 'scheduling', 'access'],
  },
  {
    id: 'ntp',
    name: 'NTP Security',
    description: 'Time synchronization hardening and server authentication',
    icon: 'MdAccessTime',
    tags: ['ntp', 'time', 'chrony'],
  },
];

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}
