import type { HardeningItem } from '@/types';

const commonPamItems: HardeningItem[] = [
  {
    id: 'pam-account-lockout',
    title: 'Configure Account Lockout on Failed Logins',
    description: 'Lock user accounts after a configurable number of consecutive failed authentication attempts.',
    importance:
      'Account lockout is a primary defense against brute-force attacks against local accounts. Without it, an attacker can attempt passwords indefinitely.',
    configFile: '/etc/pam.d/system-auth',
    backupCommand: 'cp -r /etc/pam.d/ /etc/pam.d.bak/',
    recommendedConfig:
      '# Add to /etc/pam.d/system-auth (RHEL) or /etc/pam.d/common-auth (Debian):\nauth required pam_tally2.so deny=5 unlock_time=900 onerr=fail audit even_deny_root\n# OR for newer systems with pam_faillock:\nauth required pam_faillock.so preauth audit deny=5 unlock_time=900\n...(between pam_env and pam_unix)\nauth [default=die] pam_faillock.so authfail audit deny=5 unlock_time=900',
    applyCommands: [
      '# For modern systems (pam_faillock, RHEL 8+, Ubuntu 22.04+)',
      "sudo bash -c 'cat > /etc/security/faillock.conf << EOF\ndeny = 5\nunlock_time = 900\neven_deny_root\naudit\nEOF'",
    ],
    verificationCommands: [
      'cat /etc/security/faillock.conf',
      '# View failed attempts for a user',
      'sudo faillock --user testuser',
    ],
    rollbackInstructions: [
      'sudo rm /etc/security/faillock.conf',
      '# Unlock a user:',
      'sudo faillock --user username --reset',
    ],
    versionDifferences: [
      {
        version: 'RHEL 7 / Ubuntu 18.04',
        notes: 'Use pam_tally2 instead of pam_faillock. Add to /etc/pam.d/system-auth: auth required pam_tally2.so deny=5 unlock_time=900',
      },
      {
        version: 'RHEL 8+ / Ubuntu 20.04+',
        notes: 'Use pam_faillock. Configure via /etc/security/faillock.conf.',
      },
    ],
    severity: 'critical',
    tags: ['pam', 'lockout', 'brute-force'],
  },
  {
    id: 'pam-login-limits',
    title: 'Set Resource Limits for Login Sessions',
    description: 'Use pam_limits to restrict system resources available to users.',
    importance:
      'Resource limits prevent denial-of-service through fork bombs and excessive resource consumption. Limits can be applied per user, group, or globally.',
    configFile: '/etc/security/limits.conf',
    backupCommand: 'cp /etc/security/limits.conf /etc/security/limits.conf.bak',
    recommendedConfig:
      '# /etc/security/limits.conf\n# Limit max processes per user\n* hard nproc 10000\n* soft nproc 5000\n\n# Limit file descriptors\n* soft nofile 65536\n* hard nofile 65536\n\n# Prevent core dumps for all users\n* hard core 0\n\n# Root limits\nroot soft nproc 10000\nroot hard nproc 20000',
    applyCommands: [
      "sudo bash -c 'cat >> /etc/security/limits.conf << EOF\n\n# Security hardening\n* hard core 0\n* hard nproc 10000\n* soft nproc 5000\n* soft nofile 65536\n* hard nofile 65536\nEOF'",
    ],
    verificationCommands: [
      'ulimit -a',
      'cat /etc/security/limits.conf',
    ],
    rollbackInstructions: [
      'sudo cp /etc/security/limits.conf.bak /etc/security/limits.conf',
    ],
    severity: 'medium',
    tags: ['pam', 'limits', 'resources'],
  },
  {
    id: 'pam-access-control',
    title: 'Restrict Login Access with pam_access',
    description: 'Use pam_access to control which users can log in from which origins.',
    importance:
      'pam_access provides fine-grained control over who can authenticate, from where, and to which services — complementing sshd\'s AllowUsers and AllowGroups directives.',
    configFile: '/etc/security/access.conf',
    backupCommand: 'cp /etc/security/access.conf /etc/security/access.conf.bak',
    recommendedConfig:
      '# Allow admin group from local network\n+ : admins : 192.168.1.0/24\n# Allow root only from console\n+ : root : LOCAL\n# Deny everyone else\n- : ALL : ALL',
    applyCommands: [
      "sudo bash -c 'cat > /etc/security/access.conf << EOF\n# Allow admin group from local network\n+ : admins : 192.168.1.0/24\n# Allow root only from console\n+ : root : LOCAL\n# Deny everyone else\n- : ALL : ALL\nEOF'",
      '# Enable pam_access in PAM config',
      "echo 'account required pam_access.so' | sudo tee -a /etc/pam.d/login",
    ],
    verificationCommands: [
      'cat /etc/security/access.conf',
    ],
    rollbackInstructions: [
      'sudo cp /etc/security/access.conf.bak /etc/security/access.conf',
    ],
    severity: 'high',
    tags: ['pam', 'access', 'restriction'],
  },
  {
    id: 'pam-su-restriction',
    title: 'Restrict su Command to Wheel Group',
    description: 'Limit the su command to members of the wheel or sudo group.',
    importance:
      'Unrestricted su access lets any user attempt to become root with just a password. Restricting it to a specific group adds a layer of authorization before privilege escalation is even attempted.',
    configFile: '/etc/pam.d/su',
    backupCommand: 'cp /etc/pam.d/su /etc/pam.d/su.bak',
    recommendedConfig: 'auth required pam_wheel.so use_uid',
    applyCommands: [
      "sudo sed -i 's/^#auth\\s*required\\s*pam_wheel.so.*/auth required pam_wheel.so use_uid/' /etc/pam.d/su",
      "grep -q 'pam_wheel.so' /etc/pam.d/su || echo 'auth required pam_wheel.so use_uid' | sudo tee -a /etc/pam.d/su",
      '# Ensure your admin user is in wheel/sudo group',
      'sudo usermod -aG wheel yourusername',
    ],
    verificationCommands: [
      "grep 'pam_wheel' /etc/pam.d/su",
      'groups yourusername',
    ],
    rollbackInstructions: [
      'sudo cp /etc/pam.d/su.bak /etc/pam.d/su',
    ],
    versionDifferences: [
      {
        version: 'Debian/Ubuntu',
        notes: 'The group is "sudo" instead of "wheel". Also check /etc/pam.d/su-l.',
        commands: ['sudo usermod -aG sudo yourusername'],
      },
    ],
    severity: 'high',
    tags: ['pam', 'su', 'wheel', 'privilege'],
  },
];

export function getPamData(_distroFamily: string): HardeningItem[] {
  return commonPamItems;
}
