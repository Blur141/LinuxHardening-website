import type { HardeningItem } from '@/types';

const commonFilesystemItems: HardeningItem[] = [
  {
    id: 'fs-mount-options',
    title: 'Harden Filesystem Mount Options',
    description: 'Add security mount options to /tmp, /var/tmp, /dev/shm, and other partitions.',
    importance:
      'Secure mount options prevent code execution from temporary directories, block SUID binaries on noisy partitions, and stop device file creation by unprivileged users — significantly limiting attack escalation paths.',
    configFile: '/etc/fstab',
    backupCommand: 'cp /etc/fstab /etc/fstab.bak',
    recommendedConfig:
      '# /tmp - no execution, no device files, no setuid\ntmpfs /tmp tmpfs defaults,rw,nosuid,nodev,noexec,relatime,size=2G 0 0\n\n# /var/tmp\ntmpfs /var/tmp tmpfs defaults,rw,nosuid,nodev,noexec,relatime,size=1G 0 0\n\n# /dev/shm\ntmpfs /dev/shm tmpfs defaults,rw,nosuid,nodev,noexec,relatime 0 0',
    applyCommands: [
      '# Bind mount /tmp with hardened options (if no separate partition)',
      'sudo mount -o remount,nosuid,nodev,noexec /tmp',
      '# Persist in fstab (add if /tmp not already listed)',
      "echo 'tmpfs /tmp tmpfs defaults,rw,nosuid,nodev,noexec,relatime,size=2G 0 0' | sudo tee -a /etc/fstab",
      "echo 'tmpfs /dev/shm tmpfs defaults,rw,nosuid,nodev,noexec,relatime 0 0' | sudo tee -a /etc/fstab",
    ],
    verificationCommands: [
      'mount | grep /tmp',
      'mount | grep /dev/shm',
      'cat /proc/mounts | grep tmp',
    ],
    rollbackInstructions: [
      'sudo cp /etc/fstab.bak /etc/fstab',
      'sudo mount -o remount /tmp',
    ],
    severity: 'high',
    tags: ['filesystem', 'mount', 'noexec', 'nosuid'],
  },
  {
    id: 'fs-sticky-bit',
    title: 'Verify Sticky Bit on World-Writable Directories',
    description: 'Ensure world-writable directories have the sticky bit set to prevent other users from deleting files.',
    importance:
      'Without the sticky bit, any user can delete files in world-writable directories. The sticky bit ensures only the file owner can delete their own files, preventing data destruction attacks.',
    applyCommands: [
      '# Find world-writable directories without sticky bit',
      "sudo find / -xdev -type d -perm -0002 ! -perm -1000 -ls 2>/dev/null",
      '# Apply sticky bit to /tmp and /var/tmp',
      'sudo chmod +t /tmp',
      'sudo chmod +t /var/tmp',
    ],
    verificationCommands: [
      'ls -la / | grep tmp',
      'stat /tmp | grep Access',
    ],
    rollbackInstructions: [
      'sudo chmod -t /tmp',
    ],
    severity: 'high',
    tags: ['filesystem', 'sticky-bit', 'permissions'],
  },
  {
    id: 'fs-suid-audit',
    title: 'Audit SUID and SGID Binaries',
    description: 'Find all SUID/SGID binaries and review them for necessity.',
    importance:
      'SUID binaries run with the file owner\'s privileges (often root) regardless of who executes them. Unnecessary SUID binaries are privilege escalation vectors that should be removed or have the SUID bit stripped.',
    applyCommands: [
      '# Find all SUID files',
      "sudo find / -xdev -type f -perm -4000 -ls 2>/dev/null",
      '# Find all SGID files',
      "sudo find / -xdev -type f -perm -2000 -ls 2>/dev/null",
      '# Remove SUID from a specific binary (example)',
      'sudo chmod u-s /usr/bin/unnecessary_binary',
    ],
    verificationCommands: [
      "sudo find /usr -xdev -type f -perm -4000 -ls 2>/dev/null",
    ],
    rollbackInstructions: [
      '# Restore SUID bit if needed',
      'sudo chmod u+s /usr/bin/binary',
    ],
    severity: 'high',
    tags: ['filesystem', 'suid', 'sgid', 'audit'],
  },
  {
    id: 'fs-permissions-sensitive',
    title: 'Harden Permissions on Sensitive Files',
    description: 'Ensure critical configuration files have appropriate restrictive permissions.',
    importance:
      'World-readable sensitive files like /etc/shadow, SSH host keys, and certificates can be exfiltrated by compromised unprivileged processes. Strict permissions are a basic but critical control.',
    applyCommands: [
      '# /etc/shadow should be 000 or 640',
      'sudo chmod 640 /etc/shadow',
      'sudo chown root:shadow /etc/shadow',
      '# /etc/gshadow',
      'sudo chmod 640 /etc/gshadow',
      '# SSH host keys',
      'sudo chmod 600 /etc/ssh/ssh_host_*_key',
      'sudo chmod 644 /etc/ssh/ssh_host_*_key.pub',
      '# /etc/passwd and /etc/group should be world-readable',
      'sudo chmod 644 /etc/passwd /etc/group',
      '# Crontabs',
      'sudo chmod 600 /etc/crontab',
      'sudo chmod 600 /etc/cron.hourly/* 2>/dev/null || true',
    ],
    verificationCommands: [
      'ls -la /etc/shadow /etc/gshadow',
      'ls -la /etc/ssh/ssh_host_*',
    ],
    rollbackInstructions: [
      'sudo chmod 640 /etc/shadow',
    ],
    severity: 'critical',
    tags: ['filesystem', 'permissions', 'sensitive-files'],
  },
  {
    id: 'fs-world-writable',
    title: 'Find and Remove World-Writable Files',
    description: 'Identify and correct world-writable files outside of expected directories.',
    importance:
      'World-writable files outside of /tmp can be modified by any user, creating potential for trojan attacks where an attacker replaces a binary or configuration file.',
    applyCommands: [
      '# Find world-writable files (excluding /proc, /sys, /tmp)',
      "sudo find / -xdev -not -path '/proc/*' -not -path '/sys/*' -not -path '/tmp/*' -type f -perm -0002 -ls 2>/dev/null",
      '# Remove world-write permission from a specific file',
      'sudo chmod o-w /path/to/file',
    ],
    verificationCommands: [
      "sudo find /etc -type f -perm -0002 -ls 2>/dev/null",
    ],
    rollbackInstructions: [
      '# Restore permissions if needed',
      'sudo chmod o+w /path/to/file',
    ],
    severity: 'high',
    tags: ['filesystem', 'world-writable', 'permissions'],
  },
];

export function getFilesystemData(_distroFamily: string): HardeningItem[] {
  return commonFilesystemItems;
}
