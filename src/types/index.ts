export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  githubUrl: string;
  liveUrl: string;
  technologies: string[];
}

export interface Skill {
  id: number;
  name: string;
  icon: string;
  url: string;
  category: 'frontend' | 'backend' | 'tools';
}

export interface SocialLink {
  id: number;
  name: string;
  url: string;
  icon: 'github' | 'linkedin';
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface Toast {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'error';
}
