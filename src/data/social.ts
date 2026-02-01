import { SocialLink, NavItem } from '../types';

export const socialLinks: SocialLink[] = [
  {
    id: 1,
    name: 'GitHub',
    url: 'https://www.github.com/abalcs',
    icon: 'github',
  },
  {
    id: 2,
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/alan-balcom/',
    icon: 'linkedin',
  },
];

export const navItems: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
  {
    label: 'Resume',
    href: 'https://drive.google.com/file/d/10Kz_z-1TEoUq3ICCFtBEyg_QAGj2uGsP/view?usp=share_link',
    external: true,
  },
];
