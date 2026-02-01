import { Skill } from '../types';

import html from '../components/Skills/images/HTML.png';
import js from '../components/Skills/images/JS.png';
import ts from '../components/Skills/images/Typescript.png';
import reactIcon from '../components/Skills/images/react.png';
import node from '../components/Skills/images/node.png';
import css from '../components/Skills/images/CSS.png';
import git from '../components/Skills/images/git.png';
import mongodb from '../components/Skills/images/mongodb.png';
import sql from '../components/Skills/images/sql.png';
import bootstrap from '../components/Skills/images/bootstrap.png';
import tailwind from '../components/Skills/images/tailwind.svg';
import graphql from '../components/Skills/images/graphql.svg';
import express from '../components/Skills/images/express.svg';
import vite from '../components/Skills/images/vite.svg';
import postgresql from '../components/Skills/images/postgresql.svg';

export const skills: Skill[] = [
  {
    id: 1,
    name: 'React',
    icon: reactIcon,
    url: 'https://reactjs.org/',
    category: 'frontend',
  },
  {
    id: 2,
    name: 'TypeScript',
    icon: ts,
    url: 'https://www.typescriptlang.org/',
    category: 'frontend',
  },
  {
    id: 3,
    name: 'JavaScript',
    icon: js,
    url: 'https://www.javascript.com',
    category: 'frontend',
  },
  {
    id: 4,
    name: 'Tailwind CSS',
    icon: tailwind,
    url: 'https://tailwindcss.com/',
    category: 'frontend',
  },
  {
    id: 5,
    name: 'Node.js',
    icon: node,
    url: 'https://nodejs.org/',
    category: 'backend',
  },
  {
    id: 6,
    name: 'Express',
    icon: express,
    url: 'https://expressjs.com/',
    category: 'backend',
  },
  {
    id: 7,
    name: 'GraphQL',
    icon: graphql,
    url: 'https://graphql.org/',
    category: 'backend',
  },
  {
    id: 8,
    name: 'PostgreSQL',
    icon: postgresql,
    url: 'https://www.postgresql.org/',
    category: 'backend',
  },
  {
    id: 9,
    name: 'MongoDB',
    icon: mongodb,
    url: 'https://www.mongodb.com/',
    category: 'backend',
  },
  {
    id: 10,
    name: 'Vite',
    icon: vite,
    url: 'https://vitejs.dev/',
    category: 'tools',
  },
  {
    id: 11,
    name: 'Git',
    icon: git,
    url: 'https://git-scm.com/',
    category: 'tools',
  },
  {
    id: 12,
    name: 'HTML',
    icon: html,
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    category: 'frontend',
  },
  {
    id: 13,
    name: 'CSS',
    icon: css,
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    category: 'frontend',
  },
  {
    id: 14,
    name: 'Bootstrap',
    icon: bootstrap,
    url: 'https://getbootstrap.com/',
    category: 'frontend',
  },
  {
    id: 15,
    name: 'SQL',
    icon: sql,
    url: 'https://en.wikipedia.org/wiki/SQL',
    category: 'backend',
  },
];
