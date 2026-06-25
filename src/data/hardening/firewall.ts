import type { HardeningItem } from '@/types';

const rhelFirewallItems: HardeningItem[] = [
  {
    id: 'firewalld-enable',
    title: 'Enable and Start FirewallD',
    description: 'Enable and start the FirewallD service on RHEL-family systems.',
    importance:
      'FirewallD is the default firewall solution on RHEL-family distributions. It provides dynamic firewall management with support for network zones and rich rules.',
    applyCommands: [
      'sudo systemctl enable --now firewalld',
    ],
    verificationCommands: [
      'sudo systemctl status firewalld',
      'sudo firewall-cmd --state',
    ],
    rollbackInstructions: ['sudo systemctl disable --now firewalld'],
    severity: 'critical',
    tags: ['firewall', 'firewalld', 'rhel'],
  },
  {
    id: 'firewalld-default-zone',
    title: 'Set Default Zone to Drop',
    description: 'Configure FirewallD to drop all traffic not explicitly allowed.',
    importance:
      'Using the drop zone as default means all inbound traffic is silently discarded unless a specific rule permits it — a deny-all, permit-by-exception approach.',
    backupCommand: 'sudo firewall-cmd --list-all-zones > /tmp/firewalld-backup.txt',
    recommendedConfig: 'Default zone: drop',
    applyCommands: [
      'sudo firewall-cmd --set-default-zone=drop',
      '# Add allowed services back explicitly',
      'sudo firewall-cmd --permanent --zone=drop --add-service=ssh',
      'sudo firewall-cmd --reload',
    ],
    verificationCommands: [
      'sudo firewall-cmd --get-default-zone',
      'sudo firewall-cmd --list-all',
    ],
    rollbackInstructions: [
      'sudo firewall-cmd --set-default-zone=public',
      'sudo firewall-cmd --reload',
    ],
    severity: 'high',
    tags: ['firewall', 'firewalld', 'zone', 'deny-all'],
  },
  {
    id: 'firewalld-essential-services',
    title: 'Allow Only Essential Services',
    description: 'Restrict inbound connections to only required services.',
    importance:
      'Minimizing allowed inbound services reduces the attack surface. Only services that are explicitly needed should be allowed through the firewall.',
    applyCommands: [
      '# Remove default broad services',
      'sudo firewall-cmd --permanent --zone=public --remove-service=dhcpv6-client',
      'sudo firewall-cmd --permanent --zone=public --remove-service=cockpit',
      '# Add only what is needed',
      'sudo firewall-cmd --permanent --zone=public --add-service=ssh',
      '# For web servers, also add:',
      '# sudo firewall-cmd --permanent --zone=public --add-service=http',
      '# sudo firewall-cmd --permanent --zone=public --add-service=https',
      'sudo firewall-cmd --reload',
    ],
    verificationCommands: [
      'sudo firewall-cmd --list-services',
      'sudo firewall-cmd --list-all',
    ],
    rollbackInstructions: [
      'sudo firewall-cmd --permanent --zone=public --add-service=dhcpv6-client',
      'sudo firewall-cmd --reload',
    ],
    severity: 'high',
    tags: ['firewall', 'firewalld', 'services'],
  },
  {
    id: 'firewalld-rate-limit',
    title: 'Rate Limit SSH Connections',
    description: 'Use FirewallD rich rules to rate-limit SSH connection attempts.',
    importance:
      'Rate limiting SSH at the firewall level provides an additional layer of brute-force protection complementing Fail2Ban — connections that exceed the threshold are silently dropped.',
    applyCommands: [
      "sudo firewall-cmd --permanent --add-rich-rule='rule service name=ssh limit value=3/m accept'",
      'sudo firewall-cmd --reload',
    ],
    verificationCommands: [
      'sudo firewall-cmd --list-rich-rules',
    ],
    rollbackInstructions: [
      "sudo firewall-cmd --permanent --remove-rich-rule='rule service name=ssh limit value=3/m accept'",
      'sudo firewall-cmd --reload',
    ],
    severity: 'high',
    tags: ['firewall', 'firewalld', 'rate-limit', 'ssh'],
  },
];

const debianFirewallItems: HardeningItem[] = [
  {
    id: 'ufw-enable',
    title: 'Enable UFW and Set Default Policies',
    description: 'Enable UFW with deny-all inbound and allow-all outbound defaults.',
    importance:
      'UFW (Uncomplicated Firewall) is the standard firewall tool on Ubuntu/Debian. Setting default deny for inbound ensures all services must be explicitly allowed.',
    applyCommands: [
      'sudo apt install -y ufw',
      'sudo ufw default deny incoming',
      'sudo ufw default allow outgoing',
      'sudo ufw allow ssh',
      'sudo ufw --force enable',
    ],
    verificationCommands: [
      'sudo ufw status verbose',
    ],
    rollbackInstructions: [
      'sudo ufw disable',
    ],
    severity: 'critical',
    tags: ['firewall', 'ufw', 'ubuntu', 'debian'],
  },
  {
    id: 'ufw-allow-services',
    title: 'Allow Required Services in UFW',
    description: 'Open only necessary ports for the services running on the system.',
    importance:
      'Following the principle of least privilege, only ports needed for the server\'s function should be allowed through the firewall.',
    applyCommands: [
      '# Allow SSH (already done during enable)',
      'sudo ufw allow 22/tcp',
      '# For web servers:',
      'sudo ufw allow 80/tcp comment "HTTP"',
      'sudo ufw allow 443/tcp comment "HTTPS"',
      '# Reload to apply',
      'sudo ufw reload',
    ],
    verificationCommands: [
      'sudo ufw status numbered',
    ],
    rollbackInstructions: [
      'sudo ufw delete allow 80/tcp',
      'sudo ufw reload',
    ],
    severity: 'high',
    tags: ['firewall', 'ufw', 'services'],
  },
  {
    id: 'ufw-rate-limit',
    title: 'Rate Limit SSH with UFW',
    description: 'Enable UFW\'s built-in rate limiting for SSH connections.',
    importance:
      'UFW\'s limit rule blocks IPs that attempt more than 6 connections within 30 seconds, providing native brute-force protection without requiring Fail2Ban for basic cases.',
    applyCommands: [
      'sudo ufw limit ssh/tcp',
      'sudo ufw reload',
    ],
    verificationCommands: [
      'sudo ufw status verbose | grep LIMIT',
    ],
    rollbackInstructions: [
      'sudo ufw delete limit ssh/tcp',
      'sudo ufw allow ssh',
      'sudo ufw reload',
    ],
    severity: 'high',
    tags: ['firewall', 'ufw', 'rate-limit', 'ssh'],
  },
  {
    id: 'ufw-logging',
    title: 'Enable UFW Logging',
    description: 'Turn on UFW logging to record blocked and allowed connections.',
    importance:
      'Firewall logs are essential for intrusion detection, incident response, and compliance auditing. UFW logging writes events to /var/log/ufw.log.',
    applyCommands: [
      'sudo ufw logging on',
      'sudo ufw logging medium',
    ],
    verificationCommands: [
      'sudo ufw status verbose | grep Logging',
      'sudo tail -20 /var/log/ufw.log',
    ],
    rollbackInstructions: ['sudo ufw logging off'],
    severity: 'medium',
    tags: ['firewall', 'ufw', 'logging'],
  },
];

const archFirewallItems: HardeningItem[] = [
  {
    id: 'nftables-enable-arch',
    title: 'Configure nftables on Arch Linux',
    description: 'Set up a basic nftables ruleset with deny-all inbound policy.',
    importance:
      'nftables is the modern replacement for iptables on Linux. On Arch, it is the recommended firewall solution providing high-performance packet filtering.',
    configFile: '/etc/nftables.conf',
    backupCommand: 'cp /etc/nftables.conf /etc/nftables.conf.bak',
    recommendedConfig:
      '#!/usr/sbin/nft -f\n\nflush ruleset\n\ntable inet filter {\n  chain input {\n    type filter hook input priority 0; policy drop;\n    ct state established,related accept\n    iif lo accept\n    icmp type echo-request limit rate 10/second accept\n    tcp dport 22 ct state new limit rate 3/minute accept\n    # tcp dport 80 accept\n    # tcp dport 443 accept\n  }\n  chain forward {\n    type filter hook forward priority 0; policy drop;\n  }\n  chain output {\n    type filter hook output priority 0; policy accept;\n  }\n}',
    applyCommands: [
      'sudo pacman -S --noconfirm nftables',
      "sudo bash -c 'cat > /etc/nftables.conf << EOF\n#!/usr/sbin/nft -f\n\nflush ruleset\n\ntable inet filter {\n  chain input {\n    type filter hook input priority 0; policy drop;\n    ct state established,related accept\n    iif lo accept\n    icmp type echo-request limit rate 10/second accept\n    tcp dport 22 ct state new limit rate 3/minute accept\n  }\n  chain forward {\n    type filter hook forward priority 0; policy drop;\n  }\n  chain output {\n    type filter hook output priority 0; policy accept;\n  }\n}\nEOF'",
      'sudo systemctl enable --now nftables',
    ],
    verificationCommands: [
      'sudo nft list ruleset',
      'sudo systemctl status nftables',
    ],
    rollbackInstructions: [
      'sudo cp /etc/nftables.conf.bak /etc/nftables.conf',
      'sudo systemctl restart nftables',
    ],
    severity: 'critical',
    tags: ['firewall', 'nftables', 'arch'],
  },
];

export function getFirewallData(distroFamily: string): HardeningItem[] {
  if (distroFamily === 'rhel') return rhelFirewallItems;
  if (distroFamily === 'arch') return archFirewallItems;
  return debianFirewallItems;
}
