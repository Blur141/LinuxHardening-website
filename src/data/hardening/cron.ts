import type { HardeningItem } from '@/types';

const commonCronItems: HardeningItem[] = [
  {
    id: 'cron-access-control',
    title: 'Restrict Cron Access to Authorized Users',
    description: 'Use cron.allow to restrict who can schedule cron jobs.',
    importance:
      'Unrestricted cron access allows any user to schedule persistent tasks, including those that regain access after an account is locked or that execute malicious payloads on a schedule.',
    configFile: '/etc/cron.allow',
    backupCommand: 'cp /etc/cron.deny /etc/cron.deny.bak 2>/dev/null; cp /etc/cron.allow /etc/cron.allow.bak 2>/dev/null',
    recommendedConfig:
      '# /etc/cron.allow - only listed users can use crontab\nroot\nadminuser',
    applyCommands: [
      '# Create cron.allow with only authorized users',
      "sudo bash -c 'echo root > /etc/cron.allow'",
      "sudo bash -c 'echo adminuser >> /etc/cron.allow'",
      '# Remove cron.deny if cron.allow exists (cron.allow takes precedence)',
      'sudo rm -f /etc/cron.deny',
      '# Set correct permissions',
      'sudo chmod 600 /etc/cron.allow',
    ],
    verificationCommands: [
      'cat /etc/cron.allow',
      'ls -la /etc/cron.allow /etc/cron.deny 2>/dev/null',
    ],
    rollbackInstructions: [
      'sudo rm /etc/cron.allow',
      "sudo bash -c 'echo ALL > /etc/cron.deny'",
    ],
    severity: 'high',
    tags: ['cron', 'access', 'authorization'],
  },
  {
    id: 'cron-permissions',
    title: 'Harden Cron Directory Permissions',
    description: 'Ensure cron directories and files have proper restrictive permissions.',
    importance:
      'World-readable or world-writable cron directories allow attackers to inject cron jobs that execute with elevated privileges. Strict permissions ensure only root can modify scheduled tasks.',
    applyCommands: [
      'sudo chmod 700 /etc/cron.d',
      'sudo chmod 700 /etc/cron.daily',
      'sudo chmod 700 /etc/cron.hourly',
      'sudo chmod 700 /etc/cron.monthly',
      'sudo chmod 700 /etc/cron.weekly',
      'sudo chmod 600 /etc/crontab',
      'sudo chown root:root /etc/crontab',
    ],
    verificationCommands: [
      'ls -la /etc/cron*',
      'stat /etc/crontab',
    ],
    rollbackInstructions: [
      'sudo chmod 755 /etc/cron.d',
      'sudo chmod 644 /etc/crontab',
    ],
    severity: 'high',
    tags: ['cron', 'permissions', 'directories'],
  },
  {
    id: 'cron-audit-jobs',
    title: 'Audit All Scheduled Cron Jobs',
    description: 'Review and document all cron jobs across system and user crontabs.',
    importance:
      'Attackers commonly use cron jobs for persistence. Regular auditing ensures no unexpected or unauthorized scheduled tasks exist on the system.',
    applyCommands: [
      '# View system-wide crontab',
      'sudo cat /etc/crontab',
      '# View cron.d files',
      'sudo ls -la /etc/cron.d/ && sudo cat /etc/cron.d/*',
      '# View all user crontabs',
      "for user in $(cut -d: -f1 /etc/passwd); do echo \"=== $user ===\"; sudo crontab -u $user -l 2>/dev/null; done",
      '# View anacron jobs',
      'cat /etc/anacrontab 2>/dev/null',
    ],
    verificationCommands: [
      'sudo ls /var/spool/cron/crontabs/',
    ],
    rollbackInstructions: [],
    severity: 'medium',
    tags: ['cron', 'audit', 'persistence'],
  },
  {
    id: 'cron-at-restrict',
    title: 'Restrict at Daemon Access',
    description: 'Restrict the at and batch commands to authorized users using at.allow.',
    importance:
      'The at daemon allows one-time scheduled commands. Like cron, it can be used for persistence by attackers. Restricting it to authorized users prevents abuse.',
    configFile: '/etc/at.allow',
    backupCommand: 'cp /etc/at.deny /etc/at.deny.bak 2>/dev/null',
    recommendedConfig: '# /etc/at.allow\nroot\nadminuser',
    applyCommands: [
      "sudo bash -c 'echo root > /etc/at.allow'",
      'sudo chmod 600 /etc/at.allow',
      'sudo rm -f /etc/at.deny',
    ],
    verificationCommands: [
      'cat /etc/at.allow',
    ],
    rollbackInstructions: [
      'sudo rm /etc/at.allow',
    ],
    severity: 'medium',
    tags: ['cron', 'at', 'scheduling', 'access'],
  },
];

export function getCronData(_distroFamily: string): HardeningItem[] {
  return commonCronItems;
}
