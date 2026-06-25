export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface VersionDifference {
  version: string;
  notes: string;
  commands?: string[];
  config?: string;
}

export interface HardeningItem {
  id: string;
  title: string;
  description: string;
  importance: string;
  configFile?: string;
  backupCommand?: string;
  recommendedConfig?: string;
  applyCommands: string[];
  restartCommands?: string[];
  verificationCommands: string[];
  rollbackInstructions?: string[];
  versionDifferences?: VersionDifference[];
  severity: Severity;
  tags: string[];
}

export interface CategoryData {
  id: string;
  title: string;
  description: string;
  items: HardeningItem[];
}

export interface Distribution {
  id: string;
  name: string;
  family: 'rhel' | 'debian' | 'arch';
  logo: string;
  versions: DistroVersion[];
  color: string;
}

export interface DistroVersion {
  id: string;
  name: string;
  codename?: string;
  lts?: boolean;
  eol?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
}

export type DistroId =
  | 'oracle'
  | 'rhel'
  | 'rocky'
  | 'alma'
  | 'fedora'
  | 'ubuntu'
  | 'debian'
  | 'arch';

export type CategoryId =
  | 'ssh'
  | 'auditd'
  | 'fail2ban'
  | 'sysctl'
  | 'firewall'
  | 'selinux'
  | 'password'
  | 'pam'
  | 'user-security'
  | 'logging'
  | 'filesystem'
  | 'network'
  | 'cron'
  | 'ntp';
