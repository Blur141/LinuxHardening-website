import type { Distribution } from '@/types';

export const distributions: Distribution[] = [
  {
    id: 'oracle',
    name: 'Oracle Linux',
    family: 'rhel',
    logo: 'SiOracle',
    color: '#C74634',
    versions: [
      { id: '9', name: 'Oracle Linux 9', lts: true },
      { id: '8', name: 'Oracle Linux 8', lts: true },
      { id: '7', name: 'Oracle Linux 7', eol: true },
    ],
  },
  {
    id: 'rhel',
    name: 'RHEL',
    family: 'rhel',
    logo: 'SiRedhat',
    color: '#EE0000',
    versions: [
      { id: '9', name: 'RHEL 9', lts: true },
      { id: '8', name: 'RHEL 8', lts: true },
      { id: '7', name: 'RHEL 7', eol: true },
    ],
  },
  {
    id: 'rocky',
    name: 'Rocky Linux',
    family: 'rhel',
    logo: 'SiRockylinux',
    color: '#10B981',
    versions: [
      { id: '9', name: 'Rocky Linux 9', lts: true },
      { id: '8', name: 'Rocky Linux 8', lts: true },
    ],
  },
  {
    id: 'alma',
    name: 'AlmaLinux',
    family: 'rhel',
    logo: 'SiAlmalinux',
    color: '#1C4ED8',
    versions: [
      { id: '9', name: 'AlmaLinux 9', lts: true },
      { id: '8', name: 'AlmaLinux 8', lts: true },
    ],
  },
  {
    id: 'fedora',
    name: 'Fedora',
    family: 'rhel',
    logo: 'SiFedora',
    color: '#3C6EB4',
    versions: [
      { id: '40', name: 'Fedora 40' },
      { id: '39', name: 'Fedora 39' },
      { id: '38', name: 'Fedora 38' },
    ],
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    family: 'debian',
    logo: 'SiUbuntu',
    color: '#E95420',
    versions: [
      { id: '24.04', name: 'Ubuntu 24.04 LTS', codename: 'Noble', lts: true },
      { id: '22.04', name: 'Ubuntu 22.04 LTS', codename: 'Jammy', lts: true },
      { id: '20.04', name: 'Ubuntu 20.04 LTS', codename: 'Focal', lts: true },
      { id: '18.04', name: 'Ubuntu 18.04 LTS', codename: 'Bionic', eol: true },
    ],
  },
  {
    id: 'debian',
    name: 'Debian',
    family: 'debian',
    logo: 'SiDebian',
    color: '#A80030',
    versions: [
      { id: '12', name: 'Debian 12', codename: 'Bookworm', lts: true },
      { id: '11', name: 'Debian 11', codename: 'Bullseye', lts: true },
      { id: '10', name: 'Debian 10', codename: 'Buster', eol: true },
    ],
  },
  {
    id: 'arch',
    name: 'Arch Linux',
    family: 'arch',
    logo: 'SiArchlinux',
    color: '#1793D1',
    versions: [
      { id: 'rolling', name: 'Rolling Release' },
    ],
  },
];

export function getDistro(id: string) {
  return distributions.find((d) => d.id === id);
}

export function getVersion(distroId: string, versionId: string) {
  const distro = getDistro(distroId);
  return distro?.versions.find((v) => v.id === versionId);
}
