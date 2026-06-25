import type { HardeningItem } from '@/types';

const rhelFail2banItems: HardeningItem[] = [
  {
    id: 'fail2ban-install-rhel',
    title: 'Install Fail2Ban on RHEL Family',
    description: 'Install Fail2Ban from EPEL repository on RHEL-based distributions.',
    importance:
      'Fail2Ban automatically blocks IP addresses that show malicious signs such as repeated failed SSH login attempts, reducing brute-force attack effectiveness.',
    applyCommands: [
      'sudo dnf install -y epel-release',
      'sudo dnf install -y fail2ban fail2ban-systemd',
    ],
    restartCommands: ['sudo systemctl enable --now fail2ban'],
    verificationCommands: [
      'sudo systemctl status fail2ban',
      'sudo fail2ban-client status',
    ],
    rollbackInstructions: [
      'sudo systemctl disable --now fail2ban',
      'sudo dnf remove -y fail2ban',
    ],
    severity: 'high',
    tags: ['fail2ban', 'install', 'rhel', 'epel'],
  },
];

const debianFail2banItems: HardeningItem[] = [
  {
    id: 'fail2ban-install-debian',
    title: 'Install Fail2Ban on Debian/Ubuntu',
    description: 'Install Fail2Ban from the default APT repository.',
    importance:
      'Fail2Ban monitors log files and automatically bans IPs with too many failed authentication attempts, significantly reducing brute-force attack effectiveness.',
    applyCommands: [
      'sudo apt update',
      'sudo apt install -y fail2ban',
    ],
    restartCommands: ['sudo systemctl enable --now fail2ban'],
    verificationCommands: [
      'sudo systemctl status fail2ban',
      'sudo fail2ban-client status',
    ],
    rollbackInstructions: [
      'sudo systemctl disable --now fail2ban',
      'sudo apt remove -y fail2ban',
    ],
    severity: 'high',
    tags: ['fail2ban', 'install', 'debian', 'ubuntu'],
  },
];

const archFail2banItems: HardeningItem[] = [
  {
    id: 'fail2ban-install-arch',
    title: 'Install Fail2Ban on Arch Linux',
    description: 'Install Fail2Ban from the official Arch repositories.',
    importance:
      'Fail2Ban protects services from brute-force attacks by banning repeat offenders at the firewall level.',
    applyCommands: [
      'sudo pacman -S --noconfirm fail2ban',
    ],
    restartCommands: ['sudo systemctl enable --now fail2ban'],
    verificationCommands: [
      'sudo systemctl status fail2ban',
      'sudo fail2ban-client status',
    ],
    rollbackInstructions: ['sudo systemctl disable --now fail2ban', 'sudo pacman -R fail2ban'],
    severity: 'high',
    tags: ['fail2ban', 'install', 'arch'],
  },
];

const commonFail2banItems: HardeningItem[] = [
  {
    id: 'fail2ban-jail-local',
    title: 'Create Jail Configuration',
    description: 'Create a local jail configuration to protect SSH and other services.',
    importance:
      'The jail.local file overrides defaults in jail.conf without being overwritten on updates. Configuring jails here ensures your settings persist across upgrades.',
    configFile: '/etc/fail2ban/jail.local',
    backupCommand: 'cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.conf.bak',
    recommendedConfig:
      '[DEFAULT]\nbantime = 3600\nfindtime = 600\nmaxretry = 3\nbackend = systemd\nignoreip = 127.0.0.1/8 ::1\n\n[sshd]\nenabled = true\nport = ssh\nfilter = sshd\nlogpath = %(sshd_log)s\nmaxretry = 3\nbantime = 86400',
    applyCommands: [
      "sudo bash -c 'cat > /etc/fail2ban/jail.local << EOF\n[DEFAULT]\nbantime = 3600\nfindtime = 600\nmaxretry = 3\nbackend = systemd\nignoreip = 127.0.0.1/8 ::1\n\n[sshd]\nenabled = true\nport = ssh\nfilter = sshd\nlogpath = %(sshd_log)s\nmaxretry = 3\nbantime = 86400\nEOF'",
    ],
    restartCommands: ['sudo systemctl restart fail2ban'],
    verificationCommands: [
      'sudo fail2ban-client status sshd',
      'sudo fail2ban-client get sshd bantime',
    ],
    rollbackInstructions: [
      'sudo rm /etc/fail2ban/jail.local',
      'sudo systemctl restart fail2ban',
    ],
    severity: 'critical',
    tags: ['fail2ban', 'jail', 'ssh', 'config'],
  },
  {
    id: 'fail2ban-custom-jail',
    title: 'Protect Additional Services',
    description:
      'Configure Fail2Ban jails for web servers and other exposed services.',
    importance:
      'Web applications and other services are also vulnerable to brute-force attacks. Configuring jails for nginx, apache, and other services extends your protection beyond SSH.',
    configFile: '/etc/fail2ban/jail.local',
    backupCommand: 'cp /etc/fail2ban/jail.local /etc/fail2ban/jail.local.bak',
    recommendedConfig:
      '[nginx-http-auth]\nenabled = true\nfilter = nginx-http-auth\nport = http,https\nlogpath = /var/log/nginx/error.log\nmaxretry = 5\n\n[nginx-limit-req]\nenabled = true\nfilter = nginx-limit-req\nport = http,https\nlogpath = /var/log/nginx/error.log\nmaxretry = 10',
    applyCommands: [
      "sudo bash -c 'cat >> /etc/fail2ban/jail.local << EOF\n\n[nginx-http-auth]\nenabled = true\nfilter = nginx-http-auth\nport = http,https\nlogpath = /var/log/nginx/error.log\nmaxretry = 5\nEOF'",
    ],
    restartCommands: ['sudo systemctl restart fail2ban'],
    verificationCommands: [
      'sudo fail2ban-client status',
      'sudo fail2ban-client status nginx-http-auth',
    ],
    rollbackInstructions: [
      'sudo cp /etc/fail2ban/jail.local.bak /etc/fail2ban/jail.local',
      'sudo systemctl restart fail2ban',
    ],
    severity: 'medium',
    tags: ['fail2ban', 'nginx', 'web', 'jail'],
  },
  {
    id: 'fail2ban-ban-management',
    title: 'Ban and Unban Management Commands',
    description: 'Reference commands for managing banned IPs with Fail2Ban.',
    importance:
      'Knowing how to list, add, and remove bans allows administrators to manage false positives and maintain access for legitimate users without disabling protections.',
    applyCommands: [
      '# List all active bans\nsudo fail2ban-client status',
      '# Unban a specific IP from sshd jail\nsudo fail2ban-client set sshd unbanip 192.168.1.100',
      '# Manually ban an IP\nsudo fail2ban-client set sshd banip 10.0.0.5',
    ],
    verificationCommands: [
      'sudo fail2ban-client status sshd',
      'sudo iptables -L f2b-sshd -n --line-numbers',
    ],
    rollbackInstructions: [],
    severity: 'low',
    tags: ['fail2ban', 'management', 'ban'],
  },
];

export function getFail2banData(distroFamily: string): HardeningItem[] {
  if (distroFamily === 'rhel') return [...rhelFail2banItems, ...commonFail2banItems];
  if (distroFamily === 'arch') return [...archFail2banItems, ...commonFail2banItems];
  return [...debianFail2banItems, ...commonFail2banItems];
}
