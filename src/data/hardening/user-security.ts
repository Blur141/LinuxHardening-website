import type { HardeningItem } from '@/types';

const commonUserSecurityItems: HardeningItem[] = [
  {
    id: 'user-lock-root',
    title: 'Lock the Root Account',
    description: 'Disable direct root logins by locking the root account password.',
    importance:
      'Locking the root account forces all privilege escalation to go through sudo, creating an audit trail. Root account compromise is prevented because the account cannot be used for direct login.',
    applyCommands: [
      'sudo passwd -l root',
    ],
    verificationCommands: [
      'sudo passwd -S root',
      '# Status should show "L" (locked)',
      "sudo grep '^root' /etc/shadow | cut -d: -f2 | head -c1",
    ],
    rollbackInstructions: [
      'sudo passwd -u root',
    ],
    severity: 'critical',
    tags: ['users', 'root', 'lock'],
  },
  {
    id: 'user-sudo-nopasswd',
    title: 'Disable NOPASSWD in sudoers',
    description: 'Ensure no sudo rules allow privilege escalation without a password.',
    importance:
      'NOPASSWD sudo rules allow attackers who compromise a user account to immediately gain root access without knowing any password. Every sudo escalation should require re-authentication.',
    configFile: '/etc/sudoers',
    backupCommand: 'sudo cp /etc/sudoers /etc/sudoers.bak',
    applyCommands: [
      '# Audit for NOPASSWD rules',
      'sudo grep -r NOPASSWD /etc/sudoers /etc/sudoers.d/',
      '# Remove NOPASSWD from any rules found',
      "sudo visudo  # edit and remove NOPASSWD: from any lines",
    ],
    verificationCommands: [
      'sudo grep -r NOPASSWD /etc/sudoers /etc/sudoers.d/',
    ],
    rollbackInstructions: [
      'sudo cp /etc/sudoers.bak /etc/sudoers',
    ],
    severity: 'critical',
    tags: ['users', 'sudo', 'nopasswd'],
  },
  {
    id: 'user-sudo-timeout',
    title: 'Set sudo Timestamp Timeout',
    description: 'Reduce how long sudo credentials are cached before re-authentication is required.',
    importance:
      'The default sudo credential cache of 15 minutes means a compromised session can escalate privileges without the attacker knowing the user\'s password. Reducing this window limits exposure.',
    configFile: '/etc/sudoers',
    backupCommand: 'sudo cp /etc/sudoers /etc/sudoers.bak',
    recommendedConfig: 'Defaults timestamp_timeout=5',
    applyCommands: [
      "echo 'Defaults timestamp_timeout=5' | sudo tee /etc/sudoers.d/timeout",
      "echo 'Defaults logfile=/var/log/sudo.log' | sudo tee -a /etc/sudoers.d/timeout",
    ],
    verificationCommands: [
      'sudo cat /etc/sudoers.d/timeout',
      'sudo visudo -c',
    ],
    rollbackInstructions: [
      'sudo rm /etc/sudoers.d/timeout',
    ],
    severity: 'high',
    tags: ['users', 'sudo', 'timeout'],
  },
  {
    id: 'user-shell-timeout',
    title: 'Set Shell Inactivity Timeout',
    description: 'Automatically close inactive shell sessions via TMOUT environment variable.',
    importance:
      'Unattended terminals left logged in are a significant risk. TMOUT causes the shell to exit after a period of inactivity, reducing the window for an attacker with physical access.',
    configFile: '/etc/profile.d/timeout.sh',
    backupCommand: 'N/A — creating new file',
    recommendedConfig:
      'readonly TMOUT=600\nexport TMOUT',
    applyCommands: [
      "sudo bash -c 'cat > /etc/profile.d/timeout.sh << EOF\nreadonly TMOUT=600\nexport TMOUT\nEOF'",
      'sudo chmod 644 /etc/profile.d/timeout.sh',
    ],
    verificationCommands: [
      'cat /etc/profile.d/timeout.sh',
      '# After re-login, check:',
      'echo $TMOUT',
    ],
    rollbackInstructions: [
      'sudo rm /etc/profile.d/timeout.sh',
    ],
    severity: 'medium',
    tags: ['users', 'shell', 'timeout'],
  },
  {
    id: 'user-disable-unused',
    title: 'Disable Unused System Accounts',
    description: 'Lock or disable system accounts that are not needed for running services.',
    importance:
      'Unused system accounts with shell access can be used by attackers as footholds. Locking accounts and setting their shell to /sbin/nologin prevents interactive use.',
    applyCommands: [
      '# List accounts with login shells (review these)',
      'getent passwd | grep -v nologin | grep -v false',
      '# Lock a specific account',
      'sudo usermod -L -s /sbin/nologin username',
      '# Set shell to nologin for service accounts',
      'sudo usermod -s /sbin/nologin nginx',
      'sudo usermod -s /sbin/nologin mysql',
    ],
    verificationCommands: [
      'sudo passwd -S username',
      'getent passwd username | cut -d: -f7',
    ],
    rollbackInstructions: [
      'sudo usermod -U -s /bin/bash username',
    ],
    severity: 'high',
    tags: ['users', 'accounts', 'disable'],
  },
  {
    id: 'user-umask',
    title: 'Set Secure Default umask',
    description: 'Configure default umask to 027 or 077 to restrict file creation permissions.',
    importance:
      'The default umask determines the permissions of newly created files and directories. A permissive umask like 022 can lead to world-readable sensitive files being created accidentally.',
    configFile: '/etc/profile',
    backupCommand: 'cp /etc/profile /etc/profile.bak',
    recommendedConfig: 'umask 027',
    applyCommands: [
      "sudo bash -c 'echo \"umask 027\" > /etc/profile.d/umask.sh'",
      "sudo sed -i 's/^umask.*/umask 027/' /etc/login.defs",
    ],
    verificationCommands: [
      'umask',
      "grep umask /etc/login.defs",
    ],
    rollbackInstructions: [
      'sudo rm /etc/profile.d/umask.sh',
      "sudo sed -i 's/^umask.*/umask 022/' /etc/login.defs",
    ],
    severity: 'medium',
    tags: ['users', 'umask', 'permissions'],
  },
];

export function getUserSecurityData(_distroFamily: string): HardeningItem[] {
  return commonUserSecurityItems;
}
