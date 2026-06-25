import type { HardeningItem } from '@/types';

const commonNetworkItems: HardeningItem[] = [
  {
    id: 'network-disable-services',
    title: 'Disable Unused Network Services',
    description: 'Stop and disable network services that are not required.',
    importance:
      'Every running network service is a potential attack surface. Services like telnet, rsh, rlogin, FTP, and NFS should be disabled if not explicitly needed, following the principle of minimal exposure.',
    applyCommands: [
      '# List all listening ports',
      'ss -tlnp',
      '# Disable telnet (use SSH instead)',
      'sudo systemctl disable --now telnet.socket 2>/dev/null || true',
      '# Disable rsh, rlogin, rexec (legacy insecure remote services)',
      'sudo systemctl disable --now rsh.socket rlogin.socket rexec.socket 2>/dev/null || true',
      '# Disable avahi-daemon (mDNS - often not needed on servers)',
      'sudo systemctl disable --now avahi-daemon 2>/dev/null || true',
      '# Disable cups (printing - usually not needed on servers)',
      'sudo systemctl disable --now cups 2>/dev/null || true',
    ],
    verificationCommands: [
      'ss -tlnp',
      'sudo systemctl list-units --type=service --state=active | grep -E "telnet|rsh|rlogin|avahi|cups"',
    ],
    rollbackInstructions: [
      'sudo systemctl enable --now avahi-daemon',
    ],
    severity: 'high',
    tags: ['network', 'services', 'disable'],
  },
  {
    id: 'network-hosts-deny',
    title: 'Configure TCP Wrappers (hosts.allow / hosts.deny)',
    description: 'Use /etc/hosts.allow and /etc/hosts.deny to restrict access to wrapped services.',
    importance:
      'TCP wrappers provide an additional access control layer for services compiled with libwrap support. Denying all by default and allowing only specific networks provides defense in depth.',
    configFile: '/etc/hosts.deny',
    backupCommand: 'cp /etc/hosts.deny /etc/hosts.deny.bak && cp /etc/hosts.allow /etc/hosts.allow.bak',
    recommendedConfig:
      '# /etc/hosts.deny - deny all\nALL: ALL\n\n# /etc/hosts.allow - allow specific networks\nsshd: 192.168.1.0/24\nALL: localhost',
    applyCommands: [
      "echo 'ALL: ALL' | sudo tee /etc/hosts.deny",
      "echo 'sshd: 192.168.1.0/24' | sudo tee /etc/hosts.allow",
      "echo 'ALL: localhost' | sudo tee -a /etc/hosts.allow",
    ],
    verificationCommands: [
      'cat /etc/hosts.deny',
      'cat /etc/hosts.allow',
      'sudo tcpdmatch sshd 192.168.1.100',
    ],
    rollbackInstructions: [
      'sudo cp /etc/hosts.deny.bak /etc/hosts.deny',
      'sudo cp /etc/hosts.allow.bak /etc/hosts.allow',
    ],
    severity: 'medium',
    tags: ['network', 'tcp-wrappers', 'access'],
  },
  {
    id: 'network-dns-resolver',
    title: 'Configure Secure DNS Resolver',
    description: 'Use DNSSEC-validating, privacy-respecting DNS resolvers.',
    importance:
      'DNS is frequently used for data exfiltration and C2 communication. Using a validating resolver with DNSSEC prevents DNS spoofing, and using encrypted DNS-over-TLS reduces eavesdropping.',
    configFile: '/etc/resolv.conf',
    backupCommand: 'cp /etc/resolv.conf /etc/resolv.conf.bak',
    recommendedConfig:
      '# Use Cloudflare DNS with DNSSEC validation\nnameserver 1.1.1.1\nnameserver 1.0.0.1\noptions edns0 trust-ad',
    applyCommands: [
      '# If using systemd-resolved (modern systems)',
      "sudo bash -c 'cat >> /etc/systemd/resolved.conf << EOF\n[Resolve]\nDNS=1.1.1.1 1.0.0.1\nDNSSEC=yes\nDNSOverTLS=yes\nEOF'",
      'sudo systemctl restart systemd-resolved',
    ],
    verificationCommands: [
      'resolvectl status',
      'resolvectl query cloudflare.com',
    ],
    rollbackInstructions: [
      'sudo cp /etc/resolv.conf.bak /etc/resolv.conf',
    ],
    severity: 'medium',
    tags: ['network', 'dns', 'dnssec'],
  },
  {
    id: 'network-arp-defense',
    title: 'Configure ARP Defense',
    description: 'Enable dynamic ARP inspection and static ARP entries for critical hosts.',
    importance:
      'ARP spoofing allows man-in-the-middle attacks on local networks. Static ARP entries for gateways and critical servers prevent ARP cache poisoning on the endpoint.',
    applyCommands: [
      '# Add static ARP entry for gateway',
      'sudo arp -s 192.168.1.1 aa:bb:cc:dd:ee:ff',
      '# Make persistent via systemd',
      "sudo bash -c 'cat > /etc/systemd/network/arp.conf << EOF\n[Neighbor]\nMACAddress=aa:bb:cc:dd:ee:ff\nAddress=192.168.1.1\nEOF'",
    ],
    verificationCommands: [
      'arp -n',
      'ip neigh show',
    ],
    rollbackInstructions: [
      'sudo arp -d 192.168.1.1',
    ],
    severity: 'medium',
    tags: ['network', 'arp', 'mitm'],
  },
];

export function getNetworkData(_distroFamily: string): HardeningItem[] {
  return commonNetworkItems;
}
