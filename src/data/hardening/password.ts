import type { HardeningItem } from '@/types';

const commonPasswordItems: HardeningItem[] = [
  {
    id: 'password-aging',
    title: 'Configure Password Aging Policies',
    description: 'Set maximum and minimum password age, warning days, and account inactivity limits.',
    importance:
      'Password aging limits the window of exposure if a password is compromised without the user\'s knowledge. Requiring regular changes forces credential rotation.',
    configFile: '/etc/login.defs',
    backupCommand: 'cp /etc/login.defs /etc/login.defs.bak',
    recommendedConfig:
      'PASS_MAX_DAYS   90\nPASS_MIN_DAYS   7\nPASS_WARN_AGE   14\nINACTIVE        30',
    applyCommands: [
      "sudo sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs",
      "sudo sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS   7/' /etc/login.defs",
      "sudo sed -i 's/^PASS_WARN_AGE.*/PASS_WARN_AGE   14/' /etc/login.defs",
      '# Apply to existing users (example for a specific user)',
      'sudo chage --maxdays 90 --mindays 7 --warndays 14 username',
    ],
    verificationCommands: [
      "grep -E '^(PASS_MAX_DAYS|PASS_MIN_DAYS|PASS_WARN_AGE)' /etc/login.defs",
      'sudo chage -l username',
    ],
    rollbackInstructions: [
      'sudo cp /etc/login.defs.bak /etc/login.defs',
    ],
    severity: 'high',
    tags: ['password', 'aging', 'compliance'],
  },
  {
    id: 'password-complexity-rhel',
    title: 'Enforce Password Complexity with pwquality',
    description: 'Configure libpwquality to enforce strong passwords with complexity requirements.',
    importance:
      'Weak passwords are the most common vector for account compromise. Enforcing length, complexity, and history requirements prevents easily guessable credentials.',
    configFile: '/etc/security/pwquality.conf',
    backupCommand: 'cp /etc/security/pwquality.conf /etc/security/pwquality.conf.bak',
    recommendedConfig:
      'minlen = 14\nminclass = 4\nmaxrepeat = 3\nmaxclassrepeat = 3\ndcredit = -1\nucredit = -1\nlcredit = -1\nocredit = -1\ndifok = 8\nbadwords = password linux admin root',
    applyCommands: [
      "sudo bash -c 'cat > /etc/security/pwquality.conf << EOF\nminlen = 14\nminclass = 4\nmaxrepeat = 3\ndcredit = -1\nucredit = -1\nlcredit = -1\nocredit = -1\ndifok = 8\nEOF'",
    ],
    verificationCommands: [
      'cat /etc/security/pwquality.conf',
      '# Test a password against policy',
      'pwscore <<< "TestPassword123!"',
    ],
    rollbackInstructions: [
      'sudo cp /etc/security/pwquality.conf.bak /etc/security/pwquality.conf',
    ],
    versionDifferences: [
      {
        version: 'RHEL/Rocky/Alma/Oracle',
        notes: 'pwquality is included in the pam_pwquality PAM module, already installed by default.',
      },
      {
        version: 'Ubuntu/Debian',
        notes: 'Install with: sudo apt install libpam-pwquality',
        commands: ['sudo apt install -y libpam-pwquality'],
      },
      {
        version: 'Arch Linux',
        notes: 'Install with: sudo pacman -S libpwquality',
        commands: ['sudo pacman -S libpwquality'],
      },
    ],
    severity: 'critical',
    tags: ['password', 'complexity', 'pwquality'],
  },
  {
    id: 'password-history',
    title: 'Enforce Password History',
    description: 'Prevent users from reusing recent passwords via PAM.',
    importance:
      'Password history prevents users from cycling back to compromised passwords. When combined with aging, it ensures credentials are genuinely rotated.',
    configFile: '/etc/pam.d/common-password',
    backupCommand: 'cp /etc/pam.d/common-password /etc/pam.d/common-password.bak',
    recommendedConfig:
      '# Add remember=12 to the pam_unix line:\npassword required pam_pwhistory.so use_authtok remember=12 enforce_for_root',
    applyCommands: [
      '# On RHEL-family systems',
      "sudo sed -i '/pam_unix.so/ s/$/ remember=12/' /etc/pam.d/system-auth",
      '# On Debian/Ubuntu',
      "sudo sed -i '/pam_unix.so/ s/$/ remember=12/' /etc/pam.d/common-password",
    ],
    verificationCommands: [
      'grep remember /etc/pam.d/system-auth 2>/dev/null || grep remember /etc/pam.d/common-password',
    ],
    rollbackInstructions: [
      'sudo cp /etc/pam.d/common-password.bak /etc/pam.d/common-password',
    ],
    versionDifferences: [
      {
        version: 'RHEL/Rocky/Alma/Oracle',
        notes: 'Edit /etc/pam.d/system-auth and /etc/pam.d/password-auth.',
      },
      {
        version: 'Ubuntu/Debian',
        notes: 'Edit /etc/pam.d/common-password.',
      },
    ],
    severity: 'high',
    tags: ['password', 'history', 'pam'],
  },
  {
    id: 'password-hash-algorithm',
    title: 'Use Strong Password Hashing Algorithm',
    description: 'Ensure passwords are hashed with SHA-512 or yescrypt instead of MD5 or DES.',
    importance:
      'MD5 and DES password hashes are trivially crackable with modern hardware. SHA-512 with a high rounds count or yescrypt (on modern systems) significantly increases the cost of offline attacks.',
    configFile: '/etc/login.defs',
    backupCommand: 'cp /etc/login.defs /etc/login.defs.bak',
    recommendedConfig: 'ENCRYPT_METHOD SHA512\nSHA_CRYPT_MIN_ROUNDS 100000\nSHA_CRYPT_MAX_ROUNDS 999999',
    applyCommands: [
      "sudo sed -i 's/^ENCRYPT_METHOD.*/ENCRYPT_METHOD SHA512/' /etc/login.defs",
      "grep -q 'SHA_CRYPT_MIN_ROUNDS' /etc/login.defs || echo 'SHA_CRYPT_MIN_ROUNDS 100000' | sudo tee -a /etc/login.defs",
    ],
    verificationCommands: [
      "grep -E '^(ENCRYPT_METHOD|SHA_CRYPT)' /etc/login.defs",
      '# Verify current user hash type',
      'sudo getent shadow root | cut -d: -f2 | cut -c1-3',
    ],
    rollbackInstructions: [
      'sudo cp /etc/login.defs.bak /etc/login.defs',
    ],
    severity: 'high',
    tags: ['password', 'hashing', 'sha512'],
  },
];

export function getPasswordData(_distroFamily: string): HardeningItem[] {
  return commonPasswordItems;
}
