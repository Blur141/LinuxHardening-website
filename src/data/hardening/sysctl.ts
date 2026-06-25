import type { HardeningItem } from '@/types';

const commonSysctlItems: HardeningItem[] = [
  {
    id: 'sysctl-network-protection',
    title: 'Network-Level Kernel Protections',
    description:
      'Enable IP spoofing protection, SYN flood defense, ICMP broadcast filtering, and disable IP forwarding.',
    importance:
      'These kernel parameters prevent common network attacks including SYN floods, IP spoofing, ICMP smurf attacks, and unauthorized packet routing through your server.',
    configFile: '/etc/sysctl.d/99-hardening.conf',
    backupCommand: 'sysctl -a > /tmp/sysctl-backup-$(date +%F).txt',
    recommendedConfig:
      '# IP Spoofing protection\nnet.ipv4.conf.all.rp_filter = 1\nnet.ipv4.conf.default.rp_filter = 1\n\n# Disable IP source routing\nnet.ipv4.conf.all.accept_source_route = 0\nnet.ipv4.conf.default.accept_source_route = 0\n\n# Disable ICMP redirect acceptance\nnet.ipv4.conf.all.accept_redirects = 0\nnet.ipv4.conf.default.accept_redirects = 0\nnet.ipv6.conf.all.accept_redirects = 0\n\n# Enable SYN flood protection\nnet.ipv4.tcp_syncookies = 1\nnet.ipv4.tcp_max_syn_backlog = 2048\nnet.ipv4.tcp_synack_retries = 2\nnet.ipv4.tcp_syn_retries = 5\n\n# Disable IP forwarding\nnet.ipv4.ip_forward = 0\nnet.ipv6.conf.all.forwarding = 0\n\n# Ignore ICMP broadcasts\nnet.ipv4.icmp_echo_ignore_broadcasts = 1\n\n# Ignore bogus ICMP errors\nnet.ipv4.icmp_ignore_bogus_error_responses = 1\n\n# Log Martian Packets\nnet.ipv4.conf.all.log_martians = 1\nnet.ipv4.conf.default.log_martians = 1',
    applyCommands: [
      "sudo bash -c 'cat > /etc/sysctl.d/99-hardening.conf << EOF\n# IP Spoofing protection\nnet.ipv4.conf.all.rp_filter = 1\nnet.ipv4.conf.default.rp_filter = 1\n\n# Disable IP source routing\nnet.ipv4.conf.all.accept_source_route = 0\nnet.ipv4.conf.default.accept_source_route = 0\n\n# Disable ICMP redirect acceptance\nnet.ipv4.conf.all.accept_redirects = 0\nnet.ipv4.conf.default.accept_redirects = 0\nnet.ipv6.conf.all.accept_redirects = 0\n\n# Enable SYN flood protection\nnet.ipv4.tcp_syncookies = 1\nnet.ipv4.tcp_max_syn_backlog = 2048\nnet.ipv4.tcp_synack_retries = 2\nnet.ipv4.tcp_syn_retries = 5\n\n# Disable IP forwarding\nnet.ipv4.ip_forward = 0\nnet.ipv6.conf.all.forwarding = 0\n\n# Ignore ICMP broadcasts\nnet.ipv4.icmp_echo_ignore_broadcasts = 1\n\n# Log Martian Packets\nnet.ipv4.conf.all.log_martians = 1\nEOF'",
      'sudo sysctl --system',
    ],
    verificationCommands: [
      'sudo sysctl net.ipv4.tcp_syncookies',
      'sudo sysctl net.ipv4.conf.all.rp_filter',
      'sudo sysctl net.ipv4.ip_forward',
      'sudo sysctl -p /etc/sysctl.d/99-hardening.conf',
    ],
    rollbackInstructions: [
      'sudo rm /etc/sysctl.d/99-hardening.conf',
      'sudo sysctl --system',
    ],
    severity: 'critical',
    tags: ['sysctl', 'network', 'kernel'],
  },
  {
    id: 'sysctl-memory-protection',
    title: 'Memory and Kernel Exploit Protections',
    description:
      'Enable ASLR, disable core dumps with setuid, and protect kernel pointers.',
    importance:
      'Address Space Layout Randomization (ASLR) randomizes memory addresses making buffer overflow exploits harder. Hiding kernel pointers prevents information disclosure that aids privilege escalation.',
    configFile: '/etc/sysctl.d/99-hardening.conf',
    backupCommand: 'sysctl -a > /tmp/sysctl-backup-$(date +%F).txt',
    recommendedConfig:
      '# Enable ASLR\nkernel.randomize_va_space = 2\n\n# Hide kernel pointers from non-root\nkernel.kptr_restrict = 2\n\n# Restrict dmesg access\nkernel.dmesg_restrict = 1\n\n# Prevent core dumps from setuid programs\nfs.suid_dumpable = 0\n\n# Restrict ptrace to own processes\nkernel.yama.ptrace_scope = 1\n\n# Restrict kernel performance events\nkernel.perf_event_paranoid = 3',
    applyCommands: [
      "sudo bash -c 'cat >> /etc/sysctl.d/99-hardening.conf << EOF\n\n# Memory and kernel exploit protections\nkernel.randomize_va_space = 2\nkernel.kptr_restrict = 2\nkernel.dmesg_restrict = 1\nfs.suid_dumpable = 0\nkernel.yama.ptrace_scope = 1\nkernel.perf_event_paranoid = 3\nEOF'",
      'sudo sysctl --system',
    ],
    verificationCommands: [
      'sudo sysctl kernel.randomize_va_space',
      'sudo sysctl kernel.kptr_restrict',
      'sudo sysctl fs.suid_dumpable',
    ],
    rollbackInstructions: [
      'sudo rm /etc/sysctl.d/99-hardening.conf',
      'sudo sysctl --system',
    ],
    severity: 'high',
    tags: ['sysctl', 'memory', 'aslr', 'kernel'],
  },
  {
    id: 'sysctl-ipv6-disable',
    title: 'Disable IPv6 if Not Required',
    description: 'Disable IPv6 stack via kernel parameters if your infrastructure does not use it.',
    importance:
      'If IPv6 is not used in your network, having it enabled increases the attack surface unnecessarily. Many security tools also have less mature IPv6 support, creating monitoring blind spots.',
    configFile: '/etc/sysctl.d/99-hardening.conf',
    backupCommand: 'sysctl -a > /tmp/sysctl-backup-$(date +%F).txt',
    recommendedConfig:
      'net.ipv6.conf.all.disable_ipv6 = 1\nnet.ipv6.conf.default.disable_ipv6 = 1\nnet.ipv6.conf.lo.disable_ipv6 = 1',
    applyCommands: [
      "sudo bash -c 'cat >> /etc/sysctl.d/99-hardening.conf << EOF\n\n# Disable IPv6\nnet.ipv6.conf.all.disable_ipv6 = 1\nnet.ipv6.conf.default.disable_ipv6 = 1\nnet.ipv6.conf.lo.disable_ipv6 = 1\nEOF'",
      'sudo sysctl --system',
    ],
    verificationCommands: [
      'sysctl net.ipv6.conf.all.disable_ipv6',
      'ip addr show | grep inet6',
    ],
    rollbackInstructions: [
      "sudo sed -i '/disable_ipv6/d' /etc/sysctl.d/99-hardening.conf",
      'sudo sysctl --system',
    ],
    severity: 'medium',
    tags: ['sysctl', 'ipv6', 'network'],
  },
  {
    id: 'sysctl-apply-verify',
    title: 'Apply and Persist Sysctl Settings',
    description: 'Apply all sysctl settings immediately and verify they persist after reboot.',
    importance:
      'Sysctl settings applied with sysctl -w are not persistent. Settings in /etc/sysctl.d/*.conf are loaded automatically at boot by systemd-sysctl.',
    applyCommands: [
      'sudo sysctl --system',
      'sudo sysctl -p /etc/sysctl.d/99-hardening.conf',
    ],
    verificationCommands: [
      'sudo sysctl -a | grep -E "syncookies|rp_filter|randomize_va"',
      'sudo systemctl status systemd-sysctl',
    ],
    rollbackInstructions: [
      'sudo rm /etc/sysctl.d/99-hardening.conf',
      'sudo sysctl --system',
    ],
    severity: 'medium',
    tags: ['sysctl', 'apply', 'persist'],
  },
];

export function getSysctlData(_distroFamily: string): HardeningItem[] {
  return commonSysctlItems;
}
