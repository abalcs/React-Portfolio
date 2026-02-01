import { Project } from '../types';

import listManager from '../components/Projects/images/ListManager.jpg';
import ecfd from '../components/Projects/images/ecfd.jpg';
import spacex from '../components/Projects/images/spacex.jpg';
import marvel from '../components/Projects/images/marvel.png';
import vaulted from '../components/Projects/images/vaulted.png';
import crypto from '../components/Projects/images/crypto.png';

export const projects: Project[] = [
  {
    id: 1,
    title: 'List Manager',
    description:
      "The classic project! I built this CRUD list manager to have an easy way for my family to keep track of the items we need.",
    image: listManager,
    githubUrl: 'https://github.com/abalcs/Grocery_List',
    liveUrl: 'https://family-grocery-app.herokuapp.com/',
    technologies: ['React', 'JavaScript', 'MongoDB', 'NodeJS', 'Express'],
  },
  {
    id: 2,
    title: 'Erie County Fire Dept',
    description:
      'Erie Country, NY Fire District needed a website. This is the template I created and provided to them.',
    image: ecfd,
    githubUrl: 'https://github.com/abalcs/ecfd',
    liveUrl: 'http://ecfd.herokuapp.com/',
    technologies: ['React', 'JavaScript', 'CSS', 'Bootstrap', 'NodeJS', 'Express'],
  },
  {
    id: 3,
    title: 'SpaceX Launches',
    description:
      'Tracks and displays information on SpaceX launches. Uses React for front end, Express, GraphQL, and the SpaceX API.',
    image: spacex,
    githubUrl: 'https://github.com/abalcs/SpaceX_Launches',
    liveUrl: 'https://serene-hollows-53834.herokuapp.com/',
    technologies: ['React', 'JavaScript', 'NodeJS', 'Express', 'GraphQL', 'SpaceX API'],
  },
  {
    id: 4,
    title: 'Marvel Archive',
    description:
      'A fun project that uses the Marvel API to show background, history, media and comic book appearances of the most popular heroes in the Marvel universe.',
    image: marvel,
    githubUrl: 'https://github.com/abalcs/Marvel-Archive',
    liveUrl: 'https://abalcs.github.io/Marvel-Archive/',
    technologies: ['JavaScript', 'Marvel API', 'CSS', 'HTML'],
  },
  {
    id: 5,
    title: 'Vaulted Baseball, LLC',
    description:
      'Vaulted Baseball is a baseball analytics company helping to serve players, coaches, and organizations with the highest quality information in the baseball industry.',
    image: vaulted,
    githubUrl: 'https://github.com/mdemarte21/vaulted',
    liveUrl: 'https://www.vaultedbaseball.com',
    technologies: ['React', 'TypeScript', 'JavaScript', 'SCSS', 'TypeORM', 'Postgres'],
  },
  {
    id: 6,
    title: 'Crypto Dash',
    description:
      'Crypto Dash is a one-stop site built to show the top 100 crypto coins by market cap as well as a scrolling carousel of the latest trending coins.',
    image: crypto,
    githubUrl: 'https://github.com/abalcs/Crypto_Dashboard',
    liveUrl: 'https://abalcs.github.io/Crypto_Dashboard/',
    technologies: ['React', 'JavaScript', 'SCSS', 'CoinGecko API'],
  },
];
