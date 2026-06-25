# Linux Hardening Guide

A modern, comprehensive reference web application for hardening Linux distributions. Provides copy-paste ready commands, configuration files, verification steps, and rollback instructions — organized by distribution, version, and security category.

> **Reference guide only.** The application never connects to, modifies, or executes anything on your systems. All commands are displayed for manual review and application by the operator.

---

## Screenshots

| Welcome | Category View | Expanded Card |
|---|---|---|
| Distro selection with quick-start links | Severity filters + live search | Config file, commands, verification, rollback |

---

## Features

- **8 Linux distributions** — Oracle Linux, RHEL, Rocky Linux, AlmaLinux, Fedora, Ubuntu, Debian, Arch Linux
- **14 hardening categories** — SSH, Auditd, Fail2Ban, Sysctl, Firewall, SELinux/AppArmor, Password Policies, PAM, User Security, Logging, Filesystem, Network, Cron, NTP
- **Distribution-aware content** — commands differ by distro family (RHEL/firewalld vs Debian/ufw vs Arch/nftables)
- **Version-specific notes** — inline callouts for version differences (e.g. pam_tally2 vs pam_faillock)
- **Per-check detail view** with:
  - Why it matters
  - Config file path + one-click backup command
  - Recommended configuration block
  - Commands to apply
  - Service restart commands
  - Verification commands
  - Rollback instructions
- **Live search** across all checks in a category (press `/` to focus)
- **Severity filter** — Critical / High / Medium / Low chips toggle inline
- **Copy-to-clipboard** on every command and config block with visual feedback
- **Syntax-highlighted code blocks** — keywords, config keys, comments
- **Dark / Light mode** toggle — defaults to dark
- **Responsive layout** — full sidebar on desktop, slide-in drawer on mobile
- **EOL / LTS badges** on version selectors

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | Shadcn/UI (badge, button) |
| Icons | React Icons (Feather + Simple Icons) |
| Theming | next-themes |
| Data | Static TypeScript modules — no database, no API |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Main SPA page (all state lives here)
│   └── globals.css         # CSS variables for light/dark themes
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # Sticky header with nav + theme toggle
│   │   ├── Sidebar.tsx     # Distro → Version → Category selector
│   │   └── Footer.tsx      # Safety disclaimer
│   ├── hardening/
│   │   ├── WelcomeScreen.tsx   # Landing with distro cards + quick-start
│   │   ├── CategoryView.tsx    # Search, severity filter, card list
│   │   ├── HardeningCard.tsx   # Collapsible check with all detail sections
│   │   ├── CodeBlock.tsx       # Syntax-highlighted + copy block
│   │   ├── CopyButton.tsx      # Clipboard button with Copied feedback
│   │   └── SeverityBadge.tsx   # Critical / High / Medium / Low pill
│   ├── search/
│   │   └── SearchBar.tsx       # Keyboard-shortcut search input
│   └── providers/
│       └── ThemeProvider.tsx   # next-themes wrapper
│
├── data/
│   ├── distributions.ts    # All distros, versions, family groupings
│   ├── categories.ts       # Category metadata (id, name, description)
│   └── hardening/
│       ├── ssh.ts          # SSH hardening items per distro family
│       ├── auditd.ts
│       ├── fail2ban.ts
│       ├── sysctl.ts
│       ├── firewall.ts
│       ├── selinux.ts      # SELinux (RHEL) + AppArmor (Debian/Arch)
│       ├── password.ts
│       ├── pam.ts
│       ├── user-security.ts
│       ├── logging.ts
│       ├── filesystem.ts
│       ├── network.ts
│       ├── cron.ts
│       ├── ntp.ts
│       └── index.ts        # getCategoryData() + searchAllCategories()
│
├── types/
│   └── index.ts            # HardeningItem, Distribution, Category, etc.
│
└── lib/
    └── utils.ts            # cn() tailwind class helper
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run start
```

The app compiles to fully static pages — no server-side runtime required. It can be deployed to any static host (Vercel, Netlify, GitHub Pages, Nginx).

---

## Data Schema

Each hardening check is a `HardeningItem`:

```typescript
interface HardeningItem {
  id: string;
  title: string;
  description: string;
  importance: string;            // "Why it matters" callout
  configFile?: string;           // e.g. /etc/ssh/sshd_config
  backupCommand?: string;        // cp ... command shown before changes
  recommendedConfig?: string;    // Config block (displayed with conf highlighting)
  applyCommands: string[];       // Ordered commands to apply the change
  restartCommands?: string[];    // systemctl restart / reload
  verificationCommands: string[]; // Commands to confirm the change took effect
  rollbackInstructions?: string[]; // How to undo
  versionDifferences?: {
    version: string;             // e.g. "RHEL 7 / Ubuntu 18.04"
    notes: string;
    commands?: string[];
  }[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}
```

### Adding a New Check

1. Open the relevant file in `src/data/hardening/` (e.g. `ssh.ts`)
2. Add a new `HardeningItem` object to the appropriate array (`commonSshItems`, `rhelSshItems`, etc.)
3. The item appears automatically in the UI — no registration needed

### Adding a New Distribution

1. Add an entry to the `distributions` array in `src/data/distributions.ts`
2. Add its icon mapping to `distroIcons` in `Sidebar.tsx` and `WelcomeScreen.tsx`
3. Each hardening data file returns items based on `distroFamily` (`'rhel' | 'debian' | 'arch'`) — extend the switch logic if the new distro needs its own content branch

### Adding a New Category

1. Add the metadata entry to `src/data/categories.ts`
2. Create `src/data/hardening/your-category.ts` exporting `getYourCategoryData(family: string): HardeningItem[]`
3. Register it in `src/data/hardening/index.ts` — add to `categoryDataMap` and `categoryMeta`
4. Add the icon to `categoryIcons` in `Sidebar.tsx` and `CategoryView.tsx`

---

## Supported Distributions & Categories

### Distributions

| Distribution | Family | Versions |
|---|---|---|
| Oracle Linux | RHEL | 7, 8, 9 |
| RHEL | RHEL | 7, 8, 9 |
| Rocky Linux | RHEL | 8, 9 |
| AlmaLinux | RHEL | 8, 9 |
| Fedora | RHEL | 38, 39, 40 |
| Ubuntu | Debian | 18.04, 20.04, 22.04, 24.04 |
| Debian | Debian | 10, 11, 12 |
| Arch Linux | Arch | Rolling |

### Categories

| Category | Key Focus |
|---|---|
| SSH Hardening | Root login, key auth, ciphers, timeouts, port, banners |
| Auditd | Log size/rotation, file watch rules, syscall auditing, immutable lock |
| Fail2Ban | Install, jail config, SSH protection, service jails |
| Sysctl Hardening | Network stack, ASLR, kernel pointer hiding, IPv6 |
| Firewall Configuration | firewalld (RHEL), UFW (Debian), nftables (Arch), rate limiting |
| SELinux / AppArmor | Enforcing mode, boolean management, file contexts, denial analysis |
| Password Policies | Aging, pwquality complexity, history, SHA-512 hashing |
| PAM Configuration | Account lockout (faillock), resource limits, access control, su restriction |
| User Security | Root lock, sudo NOPASSWD audit, timeout, umask, unused accounts |
| Logging | Persistent journald, rsyslog remote forwarding, auth log, logrotate |
| File System Security | Mount options (noexec/nosuid), sticky bit, SUID audit, file permissions |
| Network Security | Disable unused services, TCP wrappers, DNS hardening, ARP defense |
| Cron Security | cron.allow, directory permissions, job auditing, at restriction |
| NTP Security | Chrony setup, access restriction, ntpdate deprecation, sync verification |

---

## Design Principles

- **No outbound connections** — the app is purely a reference viewer. It has no analytics, no telemetry, no external API calls.
- **No database** — all content is TypeScript modules bundled at build time.
- **Distribution-aware** — content is filtered by distro family so RHEL users see `firewall-cmd` and Debian users see `ufw`, not both.
- **Operator-first UX** — every command block has a one-click copy. Config files are highlighted in amber. Rollback is always shown.
- **Expandable data** — adding a new check is one object in one file. No migrations, no schemas, no API changes.

---

## License

MIT
