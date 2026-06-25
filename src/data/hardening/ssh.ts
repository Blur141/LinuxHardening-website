import type { HardeningItem } from '@/types';

const commonSshItems: HardeningItem[] = [
  {
    id: 'ssh-disable-root',
    title: 'Disable Root Login',
    description: 'Prevent the root account from logging in directly via SSH.',
    importance:
      'Root login over SSH is a high-value target for brute-force attacks. Requiring users to log in as a normal user and then escalate privileges creates an additional audit layer and limits the attack surface.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig: 'PermitRootLogin no',
    applyCommands: [
      "sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config",
      "grep -q '^PermitRootLogin' /etc/ssh/sshd_config || echo 'PermitRootLogin no' | sudo tee -a /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep '^PermitRootLogin' /etc/ssh/sshd_config",
      'sudo sshd -t',
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'critical',
    tags: ['ssh', 'root', 'access'],
  },
  {
    id: 'ssh-disable-password-auth',
    title: 'Disable Password Authentication',
    description:
      'Enforce SSH key-based authentication and disable password logins entirely.',
    importance:
      'Password authentication is vulnerable to brute-force and dictionary attacks. Key-based authentication uses asymmetric cryptography which is exponentially harder to compromise.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig:
      'PasswordAuthentication no\nChallengeResponseAuthentication no\nKbdInteractiveAuthentication no',
    applyCommands: [
      "sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config",
      "sudo sed -i 's/^#*ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config",
      "sudo sed -i 's/^#*KbdInteractiveAuthentication.*/KbdInteractiveAuthentication no/' /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep -E '^(PasswordAuthentication|ChallengeResponseAuthentication|KbdInteractiveAuthentication)' /etc/ssh/sshd_config",
      'sudo sshd -t',
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    versionDifferences: [
      {
        version: 'Ubuntu 22.04+ / Debian 12+',
        notes:
          'KbdInteractiveAuthentication replaces ChallengeResponseAuthentication. Both options should be set to ensure compatibility.',
      },
    ],
    severity: 'critical',
    tags: ['ssh', 'password', 'key-auth'],
  },
  {
    id: 'ssh-change-port',
    title: 'Change Default SSH Port',
    description: 'Move SSH from the default port 22 to a non-standard port.',
    importance:
      'Automated scanners and bots constantly probe port 22. Changing the port reduces noise in logs and lowers the probability of automated attacks, acting as an additional obscurity layer.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig: 'Port 2222',
    applyCommands: [
      "sudo sed -i 's/^#*Port 22/Port 2222/' /etc/ssh/sshd_config",
      "grep -q '^Port' /etc/ssh/sshd_config || echo 'Port 2222' | sudo tee -a /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep '^Port' /etc/ssh/sshd_config",
      'ss -tlnp | grep 2222',
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'medium',
    tags: ['ssh', 'port', 'obscurity'],
  },
  {
    id: 'ssh-max-auth-tries',
    title: 'Limit Authentication Attempts',
    description:
      'Restrict the number of authentication retries per connection to mitigate brute-force attacks.',
    importance:
      'Limiting retries forces attackers to reconnect after every few failures, slowing down automated brute-force tools significantly and triggering Fail2Ban bans faster.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig:
      'MaxAuthTries 3\nMaxSessions 4\nLoginGraceTime 30',
    applyCommands: [
      "sudo sed -i 's/^#*MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config",
      "grep -q '^MaxAuthTries' /etc/ssh/sshd_config || echo 'MaxAuthTries 3' | sudo tee -a /etc/ssh/sshd_config",
      "sudo sed -i 's/^#*LoginGraceTime.*/LoginGraceTime 30/' /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep -E '^(MaxAuthTries|MaxSessions|LoginGraceTime)' /etc/ssh/sshd_config",
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'high',
    tags: ['ssh', 'brute-force', 'auth'],
  },
  {
    id: 'ssh-idle-timeout',
    title: 'Configure Idle Session Timeout',
    description:
      'Automatically terminate SSH sessions that have been idle for too long.',
    importance:
      'Idle sessions left open increase the window of opportunity for an attacker who gains physical or logical access to a connected terminal. Timeouts enforce session hygiene.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig:
      'ClientAliveInterval 300\nClientAliveCountMax 2',
    applyCommands: [
      "sudo sed -i 's/^#*ClientAliveInterval.*/ClientAliveInterval 300/' /etc/ssh/sshd_config",
      "grep -q '^ClientAliveInterval' /etc/ssh/sshd_config || echo 'ClientAliveInterval 300' | sudo tee -a /etc/ssh/sshd_config",
      "sudo sed -i 's/^#*ClientAliveCountMax.*/ClientAliveCountMax 2/' /etc/ssh/sshd_config",
      "grep -q '^ClientAliveCountMax' /etc/ssh/sshd_config || echo 'ClientAliveCountMax 2' | sudo tee -a /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep -E '^(ClientAliveInterval|ClientAliveCountMax)' /etc/ssh/sshd_config",
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'medium',
    tags: ['ssh', 'timeout', 'session'],
  },
  {
    id: 'ssh-disable-x11',
    title: 'Disable X11 Forwarding',
    description: 'Prevent X11 graphical forwarding over SSH connections.',
    importance:
      'X11 forwarding can be exploited to capture keystrokes and screen contents. Unless your workflow requires remote GUI applications over SSH, it should be disabled to reduce the attack surface.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig: 'X11Forwarding no',
    applyCommands: [
      "sudo sed -i 's/^#*X11Forwarding.*/X11Forwarding no/' /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep '^X11Forwarding' /etc/ssh/sshd_config",
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'medium',
    tags: ['ssh', 'x11', 'forwarding'],
  },
  {
    id: 'ssh-strong-ciphers',
    title: 'Enforce Strong Ciphers and MACs',
    description:
      'Restrict SSH to use only modern, secure cryptographic algorithms and disable legacy weak ciphers.',
    importance:
      'Older SSH ciphers (3DES, RC4, MD5) are vulnerable to cryptanalytic attacks. Enforcing modern algorithms (AES-256-GCM, ChaCha20, SHA-2) ensures encryption cannot be trivially broken.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig:
      'KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group14-sha256,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512\nCiphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr\nMACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,hmac-sha2-256,hmac-sha2-512\nHostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256',
    applyCommands: [
      "echo 'KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group14-sha256,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512' | sudo tee -a /etc/ssh/sshd_config",
      "echo 'Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr' | sudo tee -a /etc/ssh/sshd_config",
      "echo 'MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,hmac-sha2-256,hmac-sha2-512' | sudo tee -a /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      'sudo sshd -T | grep -E "ciphers|macs|kexalgorithms"',
      'sudo sshd -t',
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'high',
    tags: ['ssh', 'crypto', 'ciphers'],
  },
  {
    id: 'ssh-allow-users',
    title: 'Restrict SSH Access with AllowUsers / AllowGroups',
    description: 'Limit which users or groups are permitted to log in via SSH.',
    importance:
      'Restricting SSH access at the daemon level ensures that even if service accounts or system accounts have valid credentials, they cannot be used to open SSH sessions.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig:
      '# Replace "sshusers" with your actual group\nAllowGroups sshusers',
    applyCommands: [
      'sudo groupadd sshusers',
      'sudo usermod -aG sshusers yourusername',
      "echo 'AllowGroups sshusers' | sudo tee -a /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep -E '^(AllowUsers|AllowGroups|DenyUsers|DenyGroups)' /etc/ssh/sshd_config",
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'high',
    tags: ['ssh', 'access', 'users', 'groups'],
  },
  {
    id: 'ssh-banner',
    title: 'Configure Legal Warning Banner',
    description: 'Display a legal warning message before SSH authentication.',
    importance:
      'A login banner establishes legal notice for unauthorized users and may be required by compliance frameworks (PCI-DSS, HIPAA, SOC 2). It also deters casual intruders.',
    configFile: '/etc/ssh/sshd_config',
    backupCommand: 'cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak',
    recommendedConfig: 'Banner /etc/issue.net',
    applyCommands: [
      "sudo bash -c 'cat > /etc/issue.net << EOF\n***************************************************************************\n                            AUTHORIZED ACCESS ONLY\n\nThis system is for authorized users only. All activity is logged and\nmonitored. Unauthorized access is strictly prohibited and will be\nreported to the appropriate authorities.\n***************************************************************************\nEOF'",
      "echo 'Banner /etc/issue.net' | sudo tee -a /etc/ssh/sshd_config",
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      "grep '^Banner' /etc/ssh/sshd_config",
      'cat /etc/issue.net',
    ],
    rollbackInstructions: [
      'sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config',
      'sudo systemctl restart sshd',
    ],
    severity: 'low',
    tags: ['ssh', 'banner', 'compliance'],
  },
];

const rhelSshItems: HardeningItem[] = [
  {
    id: 'ssh-selinux-context',
    title: 'Update SELinux Port Context for Custom SSH Port',
    description:
      'If the SSH port is changed from 22, update the SELinux port label so SELinux permits the connection.',
    importance:
      'On RHEL-family systems with SELinux enforcing, the SSH daemon will be prevented from binding to unlabeled ports. Without the correct SELinux port context, SSHD will fail to start on the custom port.',
    applyCommands: [
      'sudo dnf install -y policycoreutils-python-utils',
      'sudo semanage port -a -t ssh_port_t -p tcp 2222',
      'sudo semanage port -l | grep ssh',
    ],
    restartCommands: ['sudo systemctl restart sshd'],
    verificationCommands: [
      'sudo semanage port -l | grep ssh',
      'ss -tlnp | grep sshd',
    ],
    rollbackInstructions: [
      'sudo semanage port -d -t ssh_port_t -p tcp 2222',
    ],
    versionDifferences: [
      {
        version: 'RHEL 7 / Oracle Linux 7',
        notes:
          'Use policycoreutils-python instead of policycoreutils-python-utils. Package name changed in RHEL 8+.',
        commands: ['sudo yum install -y policycoreutils-python'],
      },
    ],
    severity: 'high',
    tags: ['ssh', 'selinux', 'port', 'rhel'],
  },
  {
    id: 'ssh-firewalld-port',
    title: 'Update FirewallD for Custom SSH Port',
    description:
      'Open the new SSH port in FirewallD and remove the default port 22 rule.',
    importance:
      'FirewallD on RHEL-family systems blocks unlisted ports. Failing to update the firewall after changing the SSH port will lock you out of the server.',
    applyCommands: [
      'sudo firewall-cmd --permanent --add-port=2222/tcp',
      'sudo firewall-cmd --permanent --remove-service=ssh',
      'sudo firewall-cmd --reload',
    ],
    verificationCommands: [
      'sudo firewall-cmd --list-all',
      'ss -tlnp | grep 2222',
    ],
    rollbackInstructions: [
      'sudo firewall-cmd --permanent --remove-port=2222/tcp',
      'sudo firewall-cmd --permanent --add-service=ssh',
      'sudo firewall-cmd --reload',
    ],
    severity: 'high',
    tags: ['ssh', 'firewalld', 'port', 'rhel'],
  },
];

const debianSshItems: HardeningItem[] = [
  {
    id: 'ssh-ufw-port',
    title: 'Update UFW for Custom SSH Port',
    description: 'Allow the new SSH port in UFW and remove the old port 22 rule.',
    importance:
      'UFW (Uncomplicated Firewall) on Ubuntu/Debian blocks unlisted ports. Updating UFW before restarting SSH on the new port prevents being locked out.',
    applyCommands: [
      'sudo ufw allow 2222/tcp comment "SSH custom port"',
      'sudo ufw delete allow 22/tcp',
      'sudo ufw reload',
    ],
    verificationCommands: [
      'sudo ufw status verbose',
      'ss -tlnp | grep 2222',
    ],
    rollbackInstructions: [
      'sudo ufw delete allow 2222/tcp',
      'sudo ufw allow 22/tcp',
      'sudo ufw reload',
    ],
    severity: 'high',
    tags: ['ssh', 'ufw', 'port', 'ubuntu'],
  },
];

const archSshItems: HardeningItem[] = [
  {
    id: 'ssh-install-arch',
    title: 'Install and Enable OpenSSH on Arch Linux',
    description: 'Install OpenSSH server and enable it for automatic startup.',
    importance:
      'Arch Linux follows a minimal installation philosophy — OpenSSH is not pre-installed. It must be explicitly installed and enabled before hardening can be applied.',
    applyCommands: [
      'sudo pacman -S --noconfirm openssh',
      'sudo systemctl enable --now sshd',
    ],
    verificationCommands: [
      'sudo systemctl status sshd',
      'ss -tlnp | grep sshd',
    ],
    rollbackInstructions: ['sudo systemctl disable --now sshd'],
    severity: 'medium',
    tags: ['ssh', 'arch', 'install'],
  },
  {
    id: 'ssh-nftables-port',
    title: 'Update nftables for Custom SSH Port',
    description: 'Allow the custom SSH port in the nftables ruleset on Arch Linux.',
    importance:
      'Arch Linux uses nftables as the default packet filter. Custom SSH ports need an explicit allow rule to prevent lockout.',
    applyCommands: [
      'sudo nft add rule inet filter input tcp dport 2222 accept',
      'sudo nft-save',
    ],
    verificationCommands: [
      'sudo nft list ruleset | grep 2222',
    ],
    rollbackInstructions: [
      'sudo nft delete rule inet filter input handle $(sudo nft -a list ruleset | grep "dport 2222" | awk \'{print $NF}\')',
    ],
    severity: 'high',
    tags: ['ssh', 'nftables', 'port', 'arch'],
  },
];

export function getSshData(distroFamily: string): HardeningItem[] {
  if (distroFamily === 'rhel') return [...commonSshItems, ...rhelSshItems];
  if (distroFamily === 'debian') return [...commonSshItems, ...debianSshItems];
  return [...commonSshItems, ...archSshItems];
}
