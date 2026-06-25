import type { HardeningItem } from '@/types';

const rhelSelinuxItems: HardeningItem[] = [
  {
    id: 'selinux-enforcing',
    title: 'Set SELinux to Enforcing Mode',
    description: 'Configure SELinux to enforcing mode so policy violations are blocked, not just logged.',
    importance:
      'SELinux in permissive mode logs policy violations but does not block them. Enforcing mode is required for actual protection — it confines processes, limits damage from exploits, and prevents unauthorized access to system resources.',
    configFile: '/etc/selinux/config',
    backupCommand: 'cp /etc/selinux/config /etc/selinux/config.bak',
    recommendedConfig: 'SELINUX=enforcing\nSELINUXTYPE=targeted',
    applyCommands: [
      "sudo sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config",
      'sudo setenforce 1',
    ],
    verificationCommands: [
      'getenforce',
      'sestatus',
      "grep '^SELINUX=' /etc/selinux/config",
    ],
    rollbackInstructions: [
      "sudo sed -i 's/^SELINUX=.*/SELINUX=permissive/' /etc/selinux/config",
      'sudo setenforce 0',
    ],
    severity: 'critical',
    tags: ['selinux', 'mac', 'enforcing', 'rhel'],
  },
  {
    id: 'selinux-audit-denials',
    title: 'Analyze SELinux Denial Logs',
    description: 'Use audit2why and sealert to diagnose and resolve SELinux denials.',
    importance:
      'SELinux denials block application functionality. Understanding denial logs allows you to write targeted policy exceptions rather than disabling SELinux entirely.',
    applyCommands: [
      'sudo dnf install -y setroubleshoot-server',
      '# View recent denials',
      'sudo ausearch -m avc --start recent | audit2why',
      '# Get detailed explanation of a denial',
      'sudo sealert -a /var/log/audit/audit.log',
    ],
    verificationCommands: [
      'sudo ausearch -m avc --start today | wc -l',
    ],
    rollbackInstructions: [],
    severity: 'medium',
    tags: ['selinux', 'audit', 'troubleshoot'],
  },
  {
    id: 'selinux-boolean-management',
    title: 'Manage SELinux Booleans',
    description: 'Configure SELinux booleans to control specific policy behaviors without writing custom policies.',
    importance:
      'SELinux booleans are toggles that enable or disable specific permissions within an existing policy. Using them correctly lets you support required functionality while maintaining MAC enforcement.',
    applyCommands: [
      '# List all booleans',
      'sudo getsebool -a',
      '# Example: allow httpd to connect to the network',
      'sudo setsebool -P httpd_can_network_connect on',
      '# Example: allow FTP to read all files',
      'sudo setsebool -P ftpd_full_access off',
    ],
    verificationCommands: [
      'sudo getsebool httpd_can_network_connect',
      'sudo semanage boolean -l | grep httpd_can_network',
    ],
    rollbackInstructions: [
      'sudo setsebool -P httpd_can_network_connect off',
    ],
    severity: 'medium',
    tags: ['selinux', 'booleans', 'policy'],
  },
  {
    id: 'selinux-file-context',
    title: 'Restore Correct SELinux File Contexts',
    description: 'Relabel file contexts after file moves or permission changes.',
    importance:
      'Files copied rather than moved from outside the expected directory inherit incorrect SELinux contexts. This causes application failures. Restoring contexts is essential after deploying configuration files.',
    applyCommands: [
      '# Restore context for a specific file',
      'sudo restorecon -v /var/www/html/myapp.conf',
      '# Restore context for a directory tree',
      'sudo restorecon -Rv /var/www/html/',
      '# Schedule full filesystem relabel on next boot',
      'sudo touch /.autorelabel',
    ],
    verificationCommands: [
      'ls -lZ /var/www/html/',
      'sudo matchpathcon /var/www/html/myapp.conf',
    ],
    rollbackInstructions: [],
    severity: 'medium',
    tags: ['selinux', 'context', 'files'],
  },
];

const debianAppArmorItems: HardeningItem[] = [
  {
    id: 'apparmor-enable',
    title: 'Enable and Enforce AppArmor',
    description: 'Ensure AppArmor is active and set all profiles to enforce mode.',
    importance:
      'AppArmor is the MAC system on Ubuntu/Debian. Like SELinux in enforcing mode, AppArmor profiles in enforce mode actively block unauthorized system calls, protecting services from exploitation.',
    applyCommands: [
      'sudo apt install -y apparmor apparmor-utils',
      'sudo systemctl enable --now apparmor',
      '# Set all profiles to enforce mode',
      'sudo aa-enforce /etc/apparmor.d/*',
    ],
    verificationCommands: [
      'sudo aa-status',
      'sudo systemctl status apparmor',
      'sudo apparmor_status | grep "enforce mode"',
    ],
    rollbackInstructions: [
      '# Set all profiles to complain mode',
      'sudo aa-complain /etc/apparmor.d/*',
    ],
    severity: 'critical',
    tags: ['apparmor', 'mac', 'ubuntu', 'debian'],
  },
  {
    id: 'apparmor-profile-management',
    title: 'Manage AppArmor Profiles',
    description: 'Create, enable, disable, and audit AppArmor profiles for applications.',
    importance:
      'Well-crafted AppArmor profiles limit the damage an attacker can do even if they compromise an application. Each profile defines exactly what resources and capabilities a program is permitted.',
    applyCommands: [
      '# List all profiles and their status',
      'sudo aa-status',
      '# Set a specific profile to enforce',
      'sudo aa-enforce /etc/apparmor.d/usr.sbin.nginx',
      '# Set a profile to complain mode (logs but does not block)',
      'sudo aa-complain /etc/apparmor.d/usr.sbin.mysqld',
      '# Reload after modifying a profile',
      'sudo apparmor_parser -r /etc/apparmor.d/usr.sbin.nginx',
    ],
    verificationCommands: [
      'sudo aa-status | head -30',
    ],
    rollbackInstructions: [
      'sudo aa-disable /etc/apparmor.d/usr.sbin.nginx',
    ],
    severity: 'high',
    tags: ['apparmor', 'profiles', 'ubuntu'],
  },
  {
    id: 'apparmor-audit-denials',
    title: 'Analyze AppArmor Denial Logs',
    description: 'Review /var/log/syslog or journald for AppArmor DENIED messages.',
    importance:
      'AppArmor denials indicate either misconfigured profiles or active exploitation attempts. Regular review helps tune profiles and detect attacks early.',
    applyCommands: [
      '# View recent AppArmor denials from syslog',
      'sudo grep "apparmor.*DENIED" /var/log/syslog | tail -20',
      '# View from journald',
      'sudo journalctl -k | grep "apparmor.*DENIED" | tail -20',
      '# Use aa-logprof to update profiles based on denials',
      'sudo aa-logprof',
    ],
    verificationCommands: [
      'sudo grep "apparmor.*DENIED" /var/log/syslog | wc -l',
    ],
    rollbackInstructions: [],
    severity: 'medium',
    tags: ['apparmor', 'audit', 'denials'],
  },
];

const archMacItems: HardeningItem[] = [
  {
    id: 'arch-apparmor-setup',
    title: 'Set Up AppArmor on Arch Linux',
    description: 'Install and configure AppArmor on Arch Linux with kernel parameter support.',
    importance:
      'Arch Linux does not ship with SELinux or AppArmor enabled by default. Adding AppArmor significantly improves process isolation and is highly recommended for any production Arch deployment.',
    applyCommands: [
      'sudo pacman -S apparmor',
      '# Add kernel parameter in bootloader',
      "# For systemd-boot, add 'apparmor=1 security=apparmor' to kernel options",
      '# For GRUB: edit /etc/default/grub and add to GRUB_CMDLINE_LINUX_DEFAULT',
      "sudo sed -i 's/GRUB_CMDLINE_LINUX_DEFAULT=\"/GRUB_CMDLINE_LINUX_DEFAULT=\"apparmor=1 security=apparmor /' /etc/default/grub",
      'sudo grub-mkconfig -o /boot/grub/grub.cfg',
      'sudo systemctl enable apparmor',
    ],
    verificationCommands: [
      'sudo aa-status',
      "cat /sys/module/apparmor/parameters/enabled",
    ],
    rollbackInstructions: [
      "sudo sed -i 's/ apparmor=1 security=apparmor//' /etc/default/grub",
      'sudo grub-mkconfig -o /boot/grub/grub.cfg',
    ],
    versionDifferences: [
      {
        version: 'Arch with systemd-boot',
        notes: 'Edit /boot/loader/entries/*.conf and add "apparmor=1 security=apparmor" to the options line.',
      },
    ],
    severity: 'high',
    tags: ['apparmor', 'arch', 'mac', 'kernel'],
  },
];

export function getSelinuxData(distroFamily: string): HardeningItem[] {
  if (distroFamily === 'rhel') return rhelSelinuxItems;
  if (distroFamily === 'arch') return archMacItems;
  return debianAppArmorItems;
}
