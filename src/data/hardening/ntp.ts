import type { HardeningItem } from '@/types';

const commonNtpItems: HardeningItem[] = [
  {
    id: 'ntp-chrony-install',
    title: 'Install and Configure Chrony for NTP',
    description: 'Use Chrony as a secure, accurate NTP client and optionally server.',
    importance:
      'Accurate time synchronization is essential for log correlation, Kerberos authentication, certificate validity, and security event timestamps. Time drift can cause authentication failures and hide audit evidence.',
    configFile: '/etc/chrony.conf',
    backupCommand: 'cp /etc/chrony.conf /etc/chrony.conf.bak',
    recommendedConfig:
      '# Use verified NTP pools\npool 0.pool.ntp.org iburst\npool 1.pool.ntp.org iburst\npool 2.pool.ntp.org iburst\npool 3.pool.ntp.org iburst\n\n# Restrict NTP access (no modifications from network)\nrestrict default nomodify notrap nopeer noquery\nrestrict 127.0.0.1\nrestrict ::1\n\n# NTP server authentication (if using private NTP server)\n# server ntp.internal.local iburst key 1\n# keyfile /etc/chrony.keys\n\n# Log statistics\nlog tracking measurements statistics',
    applyCommands: [],
    restartCommands: ['sudo systemctl enable --now chronyd'],
    verificationCommands: [
      'chronyc tracking',
      'chronyc sources -v',
      'chronyc sourcestats',
    ],
    rollbackInstructions: [
      'sudo cp /etc/chrony.conf.bak /etc/chrony.conf',
      'sudo systemctl restart chronyd',
    ],
    versionDifferences: [
      {
        version: 'RHEL/Rocky/Alma/Oracle',
        notes: 'Install: sudo dnf install -y chrony. Config: /etc/chrony.conf',
        commands: ['sudo dnf install -y chrony'],
      },
      {
        version: 'Ubuntu/Debian',
        notes: 'Install: sudo apt install -y chrony. Config: /etc/chrony/chrony.conf',
        commands: ['sudo apt install -y chrony'],
      },
      {
        version: 'Arch Linux',
        notes: 'Install: sudo pacman -S chrony. Config: /etc/chrony.conf',
        commands: ['sudo pacman -S chrony'],
      },
    ],
    severity: 'high',
    tags: ['ntp', 'chrony', 'time'],
  },
  {
    id: 'ntp-restrict-access',
    title: 'Restrict NTP Server Access',
    description: 'Configure NTP to prevent unauthorized modification of the time service.',
    importance:
      'An NTP server that accepts modifications from arbitrary clients can be used to skew time on your server, disrupting authentication (Kerberos) and making log timestamps unreliable.',
    configFile: '/etc/chrony.conf',
    backupCommand: 'cp /etc/chrony.conf /etc/chrony.conf.bak',
    recommendedConfig:
      'restrict default nomodify notrap nopeer noquery\nrestrict 127.0.0.1\nrestrict ::1',
    applyCommands: [
      "grep -q 'restrict default' /etc/chrony.conf || echo 'restrict default nomodify notrap nopeer noquery' | sudo tee -a /etc/chrony.conf",
    ],
    restartCommands: ['sudo systemctl restart chronyd'],
    verificationCommands: [
      'chronyc tracking',
      "grep restrict /etc/chrony.conf",
    ],
    rollbackInstructions: [
      'sudo cp /etc/chrony.conf.bak /etc/chrony.conf',
      'sudo systemctl restart chronyd',
    ],
    severity: 'medium',
    tags: ['ntp', 'restrict', 'access'],
  },
  {
    id: 'ntp-disable-ntpdate',
    title: 'Disable ntpdate and Use chronyc Instead',
    description: 'Remove legacy ntpdate and use chronyc makestep for time adjustment.',
    importance:
      'ntpdate is deprecated, makes step changes that can disrupt running applications, and lacks authentication support. chronyc makestep provides a safer, one-time time synchronization.',
    applyCommands: [
      '# Force immediate time sync with chrony',
      'sudo chronyc makestep',
      '# Disable and remove ntpdate if installed',
      'sudo systemctl disable --now ntpdate 2>/dev/null || true',
    ],
    verificationCommands: [
      'chronyc tracking | grep "System time"',
      'timedatectl status',
    ],
    rollbackInstructions: [],
    severity: 'low',
    tags: ['ntp', 'ntpdate', 'chrony'],
  },
  {
    id: 'ntp-verify-sync',
    title: 'Verify NTP Synchronization Status',
    description: 'Confirm that the system clock is synchronized and the offset is within acceptable bounds.',
    importance:
      'Undetected time drift can silently break Kerberos authentication, TLS certificate validation, and make security log correlation unreliable. Regular verification catches drift before it becomes a problem.',
    applyCommands: [
      'chronyc tracking',
      'chronyc sources -v',
      'timedatectl status',
    ],
    verificationCommands: [
      'chronyc tracking | grep "System time"',
      "timedatectl | grep 'synchronized'",
    ],
    rollbackInstructions: [],
    severity: 'medium',
    tags: ['ntp', 'verify', 'sync'],
  },
];

export function getNtpData(_distroFamily: string): HardeningItem[] {
  return commonNtpItems;
}
