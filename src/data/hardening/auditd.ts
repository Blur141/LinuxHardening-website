import type { HardeningItem } from '@/types';

const commonAuditdItems: HardeningItem[] = [
  {
    id: 'auditd-install',
    title: 'Install and Enable Auditd',
    description: 'Install the Linux Audit Daemon and enable it to start at boot.',
    importance:
      'Auditd is the primary mechanism for recording security-relevant system events such as file accesses, system calls, and user logins. Many compliance frameworks (CIS, PCI-DSS, STIG) require it.',
    applyCommands: [],
    restartCommands: ['sudo systemctl enable --now auditd'],
    verificationCommands: [
      'sudo systemctl status auditd',
      'sudo auditctl -s',
    ],
    rollbackInstructions: ['sudo systemctl disable --now auditd'],
    versionDifferences: [
      {
        version: 'RHEL/Rocky/Alma/Oracle',
        notes: 'Install with: sudo dnf install -y audit audit-libs',
        commands: ['sudo dnf install -y audit audit-libs'],
      },
      {
        version: 'Ubuntu/Debian',
        notes: 'Install with: sudo apt install -y auditd audispd-plugins',
        commands: ['sudo apt install -y auditd audispd-plugins'],
      },
      {
        version: 'Arch Linux',
        notes: 'Install with: sudo pacman -S audit',
        commands: ['sudo pacman -S audit'],
      },
    ],
    severity: 'critical',
    tags: ['auditd', 'install', 'compliance'],
  },
  {
    id: 'auditd-log-size',
    title: 'Configure Audit Log Rotation and Size',
    description:
      'Set appropriate log file size, rotation count, and overflow action for auditd.',
    importance:
      'Without proper log rotation, audit logs can fill the disk and cause the system to halt (if configured with admin_space_left_action = HALT). Proper sizing ensures continuous logging without disruption.',
    configFile: '/etc/audit/auditd.conf',
    backupCommand: 'cp /etc/audit/auditd.conf /etc/audit/auditd.conf.bak',
    recommendedConfig:
      'log_file = /var/log/audit/audit.log\nlog_format = ENRICHED\nmax_log_file = 100\nnum_logs = 10\nmax_log_file_action = ROTATE\nspace_left = 250\nspace_left_action = SYSLOG\nadmin_space_left = 50\nadmin_space_left_action = SUSPEND\ndisk_full_action = SUSPEND\ndisk_error_action = SUSPEND',
    applyCommands: [
      "sudo sed -i 's/^max_log_file =.*/max_log_file = 100/' /etc/audit/auditd.conf",
      "sudo sed -i 's/^num_logs =.*/num_logs = 10/' /etc/audit/auditd.conf",
      "sudo sed -i 's/^max_log_file_action =.*/max_log_file_action = ROTATE/' /etc/audit/auditd.conf",
    ],
    restartCommands: ['sudo systemctl restart auditd'],
    verificationCommands: [
      'sudo auditctl -s',
      "grep -E '^(max_log_file|num_logs|max_log_file_action)' /etc/audit/auditd.conf",
    ],
    rollbackInstructions: [
      'sudo cp /etc/audit/auditd.conf.bak /etc/audit/auditd.conf',
      'sudo systemctl restart auditd',
    ],
    severity: 'high',
    tags: ['auditd', 'logging', 'rotation'],
  },
  {
    id: 'auditd-file-rules',
    title: 'Audit Critical File Access',
    description:
      'Watch critical system files for reads, writes, and attribute changes.',
    importance:
      'Monitoring access to sensitive files like /etc/passwd, /etc/shadow, and sudoers detects unauthorized modifications or privilege escalation attempts in real time.',
    configFile: '/etc/audit/rules.d/hardening.rules',
    backupCommand: 'cp /etc/audit/rules.d/ /etc/audit/rules.d.bak/ -r',
    recommendedConfig:
      '-w /etc/passwd -p wa -k identity\n-w /etc/shadow -p wa -k identity\n-w /etc/group -p wa -k identity\n-w /etc/gshadow -p wa -k identity\n-w /etc/sudoers -p wa -k sudoers\n-w /etc/sudoers.d/ -p wa -k sudoers\n-w /etc/ssh/sshd_config -p wa -k sshd\n-w /var/log/auth.log -p wa -k auth_log\n-w /etc/pam.d/ -p wa -k pam',
    applyCommands: [
      "sudo bash -c 'cat > /etc/audit/rules.d/hardening.rules << EOF\n-w /etc/passwd -p wa -k identity\n-w /etc/shadow -p wa -k identity\n-w /etc/group -p wa -k identity\n-w /etc/gshadow -p wa -k identity\n-w /etc/sudoers -p wa -k sudoers\n-w /etc/sudoers.d/ -p wa -k sudoers\n-w /etc/ssh/sshd_config -p wa -k sshd\n-w /etc/pam.d/ -p wa -k pam\nEOF'",
      'sudo augenrules --load',
    ],
    restartCommands: ['sudo systemctl restart auditd'],
    verificationCommands: [
      'sudo auditctl -l | grep identity',
      'sudo auditctl -l | grep sudoers',
    ],
    rollbackInstructions: [
      'sudo rm /etc/audit/rules.d/hardening.rules',
      'sudo augenrules --load',
      'sudo systemctl restart auditd',
    ],
    severity: 'critical',
    tags: ['auditd', 'files', 'monitoring'],
  },
  {
    id: 'auditd-syscall-rules',
    title: 'Audit Privileged System Calls',
    description: 'Monitor privileged system calls that could indicate an attack or privilege escalation.',
    importance:
      'System calls like setuid, chmod, and chown on privileged binaries can be abused to escalate privileges. Auditing them creates a forensic trail for incident response.',
    configFile: '/etc/audit/rules.d/privileged.rules',
    backupCommand: 'cp /etc/audit/rules.d/ /etc/audit/rules.d.bak/ -r',
    recommendedConfig:
      '-a always,exit -F arch=b64 -S execve -F euid=0 -k exec_priv\n-a always,exit -F arch=b64 -S open,openat -F exit=-EACCES -k access\n-a always,exit -F arch=b64 -S chmod,fchmod,chown,lchown -k perm_change\n-a always,exit -F arch=b64 -S setuid,setreuid,setresuid -k privilege_esc\n-a always,exit -F arch=b64 -S kill -k signal\n-a always,exit -F arch=b64 -S ptrace -k ptrace\n-e 2',
    applyCommands: [
      "sudo bash -c 'cat > /etc/audit/rules.d/privileged.rules << EOF\n-a always,exit -F arch=b64 -S execve -F euid=0 -k exec_priv\n-a always,exit -F arch=b64 -S open,openat -F exit=-EACCES -k access\n-a always,exit -F arch=b64 -S chmod,fchmod,chown,lchown -k perm_change\n-a always,exit -F arch=b64 -S setuid,setreuid,setresuid -k privilege_esc\n-a always,exit -F arch=b64 -S kill -k signal\n-a always,exit -F arch=b64 -S ptrace -k ptrace\n-e 2\nEOF'",
      'sudo augenrules --load',
    ],
    restartCommands: ['sudo systemctl restart auditd'],
    verificationCommands: [
      'sudo auditctl -l',
      'sudo auditctl -s | grep enabled',
    ],
    rollbackInstructions: [
      'sudo rm /etc/audit/rules.d/privileged.rules',
      'sudo augenrules --load',
      'sudo systemctl restart auditd',
    ],
    severity: 'high',
    tags: ['auditd', 'syscalls', 'privilege'],
  },
  {
    id: 'auditd-immutable',
    title: 'Make Audit Rules Immutable',
    description:
      'Lock the audit configuration to prevent changes without a reboot.',
    importance:
      'The -e 2 flag makes audit rules immutable until the next reboot, preventing attackers who gain temporary root access from disabling auditing to cover their tracks.',
    configFile: '/etc/audit/rules.d/99-finalize.rules',
    backupCommand: 'N/A — creating new file',
    recommendedConfig: '-e 2',
    applyCommands: [
      "echo '-e 2' | sudo tee /etc/audit/rules.d/99-finalize.rules",
      'sudo augenrules --load',
    ],
    restartCommands: ['sudo systemctl restart auditd'],
    verificationCommands: [
      'sudo auditctl -s | grep enabled',
    ],
    rollbackInstructions: [
      'sudo rm /etc/audit/rules.d/99-finalize.rules',
      'sudo augenrules --load',
      '# NOTE: Reboot required to remove immutable flag if already loaded',
    ],
    severity: 'high',
    tags: ['auditd', 'immutable', 'tamper-proof'],
  },
];

export function getAuditdData(_distroFamily: string): HardeningItem[] {
  return commonAuditdItems;
}
