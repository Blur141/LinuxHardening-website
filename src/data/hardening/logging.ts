import type { HardeningItem } from '@/types';

const rhelLoggingItems: HardeningItem[] = [
  {
    id: 'logging-journald-persistent',
    title: 'Enable Persistent Journald Logging',
    description: 'Configure systemd-journald to write logs to disk persistently.',
    importance:
      'By default, journald stores logs in memory and they are lost on reboot. Persistent storage ensures logs survive system crashes and reboots, critical for forensics.',
    configFile: '/etc/systemd/journald.conf',
    backupCommand: 'cp /etc/systemd/journald.conf /etc/systemd/journald.conf.bak',
    recommendedConfig:
      '[Journal]\nStorage=persistent\nCompress=yes\nSyncIntervalSec=5m\nRateLimitIntervalSec=30s\nRateLimitBurst=10000\nMaxRetentionSec=1month\nForwardToSyslog=yes',
    applyCommands: [
      'sudo mkdir -p /var/log/journal',
      "sudo sed -i 's/^#*Storage=.*/Storage=persistent/' /etc/systemd/journald.conf",
      "sudo sed -i 's/^#*Compress=.*/Compress=yes/' /etc/systemd/journald.conf",
      "sudo sed -i 's/^#*ForwardToSyslog=.*/ForwardToSyslog=yes/' /etc/systemd/journald.conf",
    ],
    restartCommands: ['sudo systemctl restart systemd-journald'],
    verificationCommands: [
      'sudo journalctl --disk-usage',
      'ls /var/log/journal/',
    ],
    rollbackInstructions: [
      'sudo cp /etc/systemd/journald.conf.bak /etc/systemd/journald.conf',
      'sudo systemctl restart systemd-journald',
    ],
    severity: 'high',
    tags: ['logging', 'journald', 'persistent'],
  },
];

const commonLoggingItems: HardeningItem[] = [
  {
    id: 'logging-rsyslog-remote',
    title: 'Configure Rsyslog for Remote Log Forwarding',
    description: 'Forward system logs to a remote syslog server for centralized collection.',
    importance:
      'Storing logs only on the compromised host means attackers can delete evidence. Remote log forwarding ensures a tamper-resistant copy of all events is maintained on a separate system.',
    configFile: '/etc/rsyslog.conf',
    backupCommand: 'cp /etc/rsyslog.conf /etc/rsyslog.conf.bak',
    recommendedConfig:
      '# Forward all logs to remote syslog server\n*.* @@192.168.1.100:514\n# Use @@ for TCP (reliable), @ for UDP',
    applyCommands: [
      "echo '*.* @@192.168.1.100:514' | sudo tee -a /etc/rsyslog.conf",
    ],
    restartCommands: ['sudo systemctl restart rsyslog'],
    verificationCommands: [
      'sudo rsyslogd -N1',
      'sudo systemctl status rsyslog',
    ],
    rollbackInstructions: [
      'sudo cp /etc/rsyslog.conf.bak /etc/rsyslog.conf',
      'sudo systemctl restart rsyslog',
    ],
    versionDifferences: [
      {
        version: 'RHEL/Rocky/Alma/Oracle',
        notes: 'Install rsyslog with: sudo dnf install -y rsyslog',
        commands: ['sudo dnf install -y rsyslog'],
      },
      {
        version: 'Ubuntu/Debian',
        notes: 'Install rsyslog with: sudo apt install -y rsyslog',
        commands: ['sudo apt install -y rsyslog'],
      },
    ],
    severity: 'high',
    tags: ['logging', 'rsyslog', 'remote', 'siem'],
  },
  {
    id: 'logging-auth-logs',
    title: 'Configure Authentication Log Monitoring',
    description: 'Ensure authentication events are logged and retained.',
    importance:
      'Authentication logs track successful and failed login attempts, sudo use, and privilege escalation. They are essential for detecting brute-force attacks and insider threats.',
    applyCommands: [
      '# Verify auth log is being written',
      'sudo ls -la /var/log/auth.log 2>/dev/null || sudo ls -la /var/log/secure',
      '# Watch live auth events',
      'sudo tail -f /var/log/auth.log',
      '# Check for failed logins',
      'sudo grep "Failed password" /var/log/auth.log | tail -20',
      '# Check sudo usage',
      'sudo grep "sudo:" /var/log/auth.log | tail -20',
    ],
    verificationCommands: [
      'sudo lastlog | grep -v Never | head -20',
      'sudo last | head -20',
    ],
    rollbackInstructions: [],
    versionDifferences: [
      {
        version: 'RHEL/Rocky/Alma/Oracle/Fedora',
        notes: 'Auth log is at /var/log/secure',
      },
      {
        version: 'Ubuntu/Debian',
        notes: 'Auth log is at /var/log/auth.log',
      },
    ],
    severity: 'high',
    tags: ['logging', 'auth', 'monitoring'],
  },
  {
    id: 'logging-logrotate',
    title: 'Configure Log Rotation',
    description: 'Ensure logs are rotated, compressed, and retained for a sufficient period.',
    importance:
      'Without log rotation, logs can consume all disk space causing system failures. With proper rotation, old logs are compressed and retained for compliance requirements while disk space is managed.',
    configFile: '/etc/logrotate.conf',
    backupCommand: 'cp /etc/logrotate.conf /etc/logrotate.conf.bak',
    recommendedConfig:
      'weekly\nrotate 52\ncompress\ndelaycompress\nmissingok\nnotifempty\nincludeconfig /etc/logrotate.d',
    applyCommands: [
      "sudo bash -c 'cat > /etc/logrotate.d/hardening << EOF\n/var/log/auth.log\n/var/log/syslog {\n  weekly\n  rotate 52\n  compress\n  delaycompress\n  missingok\n  notifempty\n  sharedscripts\n  postrotate\n    /bin/kill -HUP $(cat /var/run/rsyslogd.pid) 2>/dev/null || true\n  endscript\n}\nEOF'",
    ],
    verificationCommands: [
      'sudo logrotate -d /etc/logrotate.conf',
      'sudo logrotate --force /etc/logrotate.conf',
    ],
    rollbackInstructions: [
      'sudo cp /etc/logrotate.conf.bak /etc/logrotate.conf',
    ],
    severity: 'medium',
    tags: ['logging', 'logrotate', 'retention'],
  },
];

export function getLoggingData(distroFamily: string): HardeningItem[] {
  if (distroFamily === 'rhel') return [...rhelLoggingItems, ...commonLoggingItems];
  return commonLoggingItems;
}
