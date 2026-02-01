import { Skill } from '../types';

import html from '../components/Skills/images/HTML.png';
import js from '../components/Skills/images/JS.png';
import bootstrap from '../components/Skills/images/bootstrap.png';
import css from '../components/Skills/images/CSS.png';
import git from '../components/Skills/images/git.png';
import jquery from '../components/Skills/images/jquery.png';
import mongodb from '../components/Skills/images/mongodb.png';
import node from '../components/Skills/images/node.png';
import reactIcon from '../components/Skills/images/react.png';
import sql from '../components/Skills/images/sql.png';
import ts from '../components/Skills/images/Typescript.png';
import mui from '../components/Skills/images/mui.png';

export const skills: Skill[] = [
  {
    id: 1,
    name: 'HTML',
    icon: html,
    url: 'https://en.wikipedia.org/wiki/HTML',
    category: 'frontend',
  },
  {
    id: 2,
    name: 'JavaScript',
    icon: js,
    url: 'https://www.javascript.com',
    category: 'frontend',
  },
  {
    id: 3,
    name: 'TypeScript',
    icon: ts,
    url: 'https://www.typescriptlang.org/',
    category: 'frontend',
  },
  {
    id: 4,
    name: 'Bootstrap',
    icon: bootstrap,
    url: 'https://getbootstrap.com/',
    category: 'frontend',
  },
  {
    id: 5,
    name: 'Material UI',
    icon: mui,
    url: 'https://mui.com/',
    category: 'frontend',
  },
  {
    id: 6,
    name: 'CSS',
    icon: css,
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    category: 'frontend',
  },
  {
    id: 7,
    name: 'Git',
    icon: git,
    url: 'https://git-scm.com/',
    category: 'tools',
  },
  {
    id: 8,
    name: 'jQuery',
    icon: jquery,
    url: 'https://jquery.com/',
    category: 'frontend',
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
    name: 'NodeJS',
    icon: node,
    url: 'https://nodejs.org/en/',
    category: 'backend',
  },
  {
    id: 11,
    name: 'React',
    icon: reactIcon,
    url: 'https://reactjs.org/',
    category: 'frontend',
  },
  {
    id: 12,
    name: 'SQL',
    icon: sql,
    url: 'https://en.wikipedia.org/wiki/SQL',
    category: 'backend',
  },
];
